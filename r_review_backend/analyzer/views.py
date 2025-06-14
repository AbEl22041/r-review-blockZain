import os
import json
import jwt
import qrcode
from io import BytesIO
from django.http import HttpResponse
from django.conf import settings
from django.db.models import Avg
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from analyzer.models import Review, Restaurant
from openai import OpenAI
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

FIXED_RESTAURANT_ID = 1
client = OpenAI(api_key=settings.OPENAI_API_KEY)

def transcribe_audio(file_path):
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        return transcript.text
import re
import json

def analyze_text_review(review_text):
    prompt = f"""
You are an expert in sentiment analysis and customer review evaluation.
Given the following restaurant review, summarize the sentiment, extract key points (e.g., food, service, ambiance), and provide a short suggestion for improvement if necessary.
Rate each aspect from 1 to 5 stars. Translate non-English text even if it is Hassaniya or dialects, try your best to translate it to English.
Total rating must be a number between 1 and 5. If unsure, return 0.

\"\"\"{review_text}\"\"\"

Return *only* valid JSON like this:
{{
  "sentiment": "...",
  "aspects": {{
    "food": "...",
    "service": "...",
    "ambiance": "..."
  }},
  "suggestion": "...",
  "translated_review": "...",
  "total_rating": ...
}}
"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )
    full_response = response.choices[0].message.content.strip()
    
    # Debug: log full response
    print("Full AI response:", full_response)
    
    # Extract JSON part (first {...} block)
    json_match = re.search(r"\{.*\}", full_response, re.DOTALL)
    if not json_match:
        raise ValueError(f"JSON not found in AI response.\nResponse was:\n{full_response}")
    
    clean_json_str = json_match.group(0)
    
    # Parse and validate JSON
    try:
        parsed_json = json.loads(clean_json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from AI response: {e}\nJSON string was:\n{clean_json_str}")

    # Ensure total_rating is a number between 0 and 5
    rating = parsed_json.get("total_rating", 0)
    try:
        rating_num = float(rating)
        if rating_num < 0 or rating_num > 5:
            rating_num = 0
    except (ValueError, TypeError):
        rating_num = 0
    
    parsed_json["total_rating"] = rating_num

    # Return cleaned JSON string
    return json.dumps(parsed_json)


from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os, json

class ReviewAnalysisView(APIView):
    parser_classes = [MultiPartParser, JSONParser]  # support multipart and JSON

    def post(self, request, *args, **kwargs):
        restaurant_id = kwargs.get("restaurant_id")
        if not restaurant_id:
            return Response({"error": "Restaurant ID not provided."}, status=400)

        if not Restaurant.objects.filter(id=restaurant_id).exists():
            return Response({"error": "Invalid restaurant ID."}, status=404)

        file = request.FILES.get("file")
        text_review = None

        # Case 1: If multipart form with "text" field (e.g. text input + optional file)
        if "text" in request.data:
            text_review = request.data.get("text")

        # Case 2: If JSON body with "text" field
        elif hasattr(request, 'data') and isinstance(request.data, dict) and "text" in request.data:
            text_review = request.data.get("text")

        # Case 3: If only file provided (audio or text file)
        if file and not text_review:
            # Save file temporarily
            temp_path = os.path.join("temp", file.name)
            os.makedirs("temp", exist_ok=True)

            with open(temp_path, "wb+") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            try:
                if file.name.endswith((".mp3", ".wav", ".m4a", ".webm")):
                    text_review = transcribe_audio(temp_path)
                else:
                    with open(temp_path, "r", encoding="utf-8") as f:
                        text_review = f.read()
            finally:
                os.remove(temp_path)

        if not text_review:
            return Response({"error": "No valid text or audio file provided."}, status=400)

        analysis = analyze_text_review(text_review)

        try:
            parsed = json.loads(analysis)
        except json.JSONDecodeError:
            return Response({"error": "Failed to parse AI analysis JSON."}, status=500)

        Review.objects.create(
            restaurant_id=restaurant_id,
            text=parsed.get("translated_review", text_review),
            rating=parsed.get("total_rating", 0),
            sentiment=parsed.get("sentiment"),
            suggestion=parsed.get("suggestion"),
        )

        return Response({
            "transcription": text_review,
            "analysis": parsed
        }, status=201)
class RestaurantReviewListView(APIView):
    def get(self, request, restaurant_id):
        reviews = Review.objects.filter(restaurant_id=restaurant_id)
        data = [
            {
                "text": review.text,
                "sentiment": review.sentiment,
                "rating": review.rating,
                "suggestion": review.suggestion,
                "created_at": review.created_at,
            }
            for review in reviews
        ]
        avg_rating = reviews.aggregate(avg=Avg("rating"))["avg"]
        return Response({
            "reviews": data,
            "average_rating": round(avg_rating or 0, 1),
        }, status=status.HTTP_200_OK)

class QRTokenValidateView(APIView):
    def post(self, request):
        return Response({"valid": True, "restaurant_id": 1})

class QRCodeGenerateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, restaurant_id):
        scheme = "http"
        host = "localhost:3000" 
        qr_data = f"{scheme}://{host}/restaurant/{restaurant_id}"  
        qr = qrcode.make(qr_data)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer.getvalue(), content_type="image/png")

@method_decorator(csrf_exempt, name='dispatch')
class RestaurantRegisterView(APIView):
    def post(self, request):
        name = request.data.get("name")
        city = request.data.get("city")
        if not name or not city:
            return Response({"error": "Name and city are required"}, status=400)

        restaurant = Restaurant.objects.create(name=name, city=city)

        host = request.get_host()
        scheme = "https" if request.is_secure() else "http"
        qr_url = f"{scheme}://{host}/api/restaurant/{restaurant.id}/qr/"

        return Response({
            "id": restaurant.id,
            "name": restaurant.name,
            "city": restaurant.city,
            "qr_url": qr_url
        }, status=201)
class RestaurantListView(APIView):
    def get(self, request):
        restaurants = Restaurant.objects.all()
        data = []
        for restaurant in restaurants:
            avg_rating = Review.objects.filter(restaurant_id=restaurant.id).aggregate(avg=Avg("rating"))["avg"]
            data.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "city": restaurant.city,
                "average_rating": round(avg_rating or 0, 1)
            })
        return Response(data, status=status.HTTP_200_OK)

class RestaurantDetailView(APIView):
    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        avg_rating = Review.objects.filter(restaurant_id=restaurant.id).aggregate(avg=Avg("rating"))["avg"]
        return Response({
            "id": restaurant.id,
            "name": restaurant.name,
            "city": restaurant.city,
            "average_rating": round(avg_rating or 0, 1)
        }, status=status.HTTP_200_OK)

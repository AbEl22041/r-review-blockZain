from django.contrib import admin
from django.urls import path,include
from .views import (
    ReviewAnalysisView,
    RestaurantReviewListView,
    QRTokenValidateView,
    QRCodeGenerateView,
    RestaurantRegisterView,
    RestaurantListView,
    RestaurantDetailView
)

urlpatterns = [
    path("restaurant/<int:restaurant_id>/analyze/", ReviewAnalysisView.as_view(), name="analyze-review"),

    path("restaurant/<int:restaurant_id>/reviews/", RestaurantReviewListView.as_view()),
    path("restaurant/<int:restaurant_id>/qr/", QRCodeGenerateView.as_view()),
    path("restaurant/register/", RestaurantRegisterView.as_view()),

    path("restaurants/", RestaurantListView.as_view(), name="restaurant-list"),
    path("restaurant/<int:restaurant_id>/", RestaurantDetailView.as_view(), name="restaurant-detail"),

    path("qr/validate/", QRTokenValidateView.as_view()),
]

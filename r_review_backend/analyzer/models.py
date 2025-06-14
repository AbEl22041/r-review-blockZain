from django.db import models

class Review(models.Model):
    restaurant_id = models.IntegerField()
    text = models.TextField()  
    rating = models.IntegerField(null=True, blank=True)
    sentiment = models.CharField(max_length=50, null=True, blank=True)
    suggestion = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.city})"
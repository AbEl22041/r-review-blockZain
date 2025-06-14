# Generated by Django 5.2.1 on 2025-06-11 20:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyzer', '0002_review_delete_reviewaccesstoken'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='rating',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='review',
            name='sentiment',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='review',
            name='suggestion',
            field=models.TextField(blank=True, null=True),
        ),
    ]

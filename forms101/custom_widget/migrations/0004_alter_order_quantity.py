# Generated by Django 5.0.1 on 2024-06-28 09:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("custom_widget", "0003_order"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="quantity",
            field=models.DecimalField(decimal_places=0, max_digits=5),
        ),
    ]
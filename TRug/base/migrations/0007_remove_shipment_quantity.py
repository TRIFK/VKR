# Generated by Django 5.0.6 on 2024-06-21 00:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0006_remove_order_quantity'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shipment',
            name='quantity',
        ),
    ]

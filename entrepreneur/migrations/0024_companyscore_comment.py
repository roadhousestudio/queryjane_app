# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-05-11 18:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entrepreneur', '0023_auto_20180504_2122'),
    ]

    operations = [
        migrations.AddField(
            model_name='companyscore',
            name='comment',
            field=models.TextField(blank=True, null=True, verbose_name='comment'),
        ),
    ]
# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-05-26 22:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corporative', '0004_legalitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='legalitem',
            name='slug',
            field=models.SlugField(default='slug'),
            preserve_default=False,
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-05-04 21:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entrepreneur', '0022_auto_20180504_2032'),
    ]

    operations = [
        migrations.AlterField(
            model_name='companyscore',
            name='score',
            field=models.FloatField(),
        ),
    ]
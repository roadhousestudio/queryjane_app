# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-05-26 22:28
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entrepreneur', '0025_companyscore_created_at'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='companyscore',
            options={'ordering': ('-created_at',), 'verbose_name': 'company score', 'verbose_name_plural': 'company scores'},
        ),
    ]

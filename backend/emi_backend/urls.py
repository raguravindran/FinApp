from django.contrib import admin
from django.urls import path

from calculator.views import emi_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/emi/", emi_view, name="emi-view"),
]

from django.contrib import admin  # <--- THIS IS MISSING
from django.urls import path
from chat import views
from django.views.static import serve
from django.conf import settings
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", views.chat_page, name="chat_page"),
    path("api/chat/", views.chat_api, name="chat_api"),
    path("offline/", views.offline_view, name="offline"),
    path("serviceworker.js", serve, {"document_root": os.path.join(settings.BASE_DIR, "static/js")}),
]
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.conf import settings
from google import genai
import os  # <--- ADD THIS LINE
from django.http import JsonResponse, HttpResponse 

# 1. Helper function to talk to Gemini
def get_gemini_response(prompt):
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # UPDATED SYSTEM INSTRUCTION
    system_instruction = (
        "You are a helpful study assistant. Provide clear, concise, and well-formatted answers "
        "using bullet points where appropriate. Use bold text for key terms. Keep it simple. "
        "IMPORTANT: Do not use LaTeX math formatting (e.g., do not write $H_2O$ or $CO_2$). "
        "Instead, write chemical formulas in plain text or using Unicode subscripts (e.g., H₂O, CO₂)."
    )
    
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config={'system_instruction': system_instruction}
    )
    return response.text
# 2. NEW: View to render your main HTML page (chats.html)
def chat_page(request):
    # Because you renamed your folder to 'chats', the path is now 'chats/chats.html'
    return render(request, "chats/chats.html")

# 3. NEW: View to render the offline fallback page
def offline_view(request):
    # Make sure you create this file later at templates/chats/offline.html
    return render(request, "chats/offline.html")

# 4. Your API endpoint for the JavaScript to call
@csrf_exempt
def chat_api(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_prompt = data.get("prompt", "").strip()
        
        if not user_prompt:
            return JsonResponse({"error": "Prompt cannot be empty."}, status=400)
            
        try:
            ai_response = get_gemini_response(user_prompt)
            return JsonResponse({"response": ai_response})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "Invalid request method."}, status=405)

def service_worker(request):
    """Serves the service worker file from the static folder."""
    sw_path = os.path.join(settings.BASE_DIR, 'static', 'js', 'serviceworker.js')
    try:
        with open(sw_path, 'r') as f:
            response = HttpResponse(f.read(), content_type='application/javascript')
        return response
    except FileNotFoundError:
        return HttpResponse("Service worker not found.", status=404)
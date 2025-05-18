# backend/app.py
import os
import requests 
import json     
import traceback 
from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# --- LM Studio Configuration ---
LM_STUDIO_URL = os.getenv("LM_STUDIO_URL", "http://localhost:1234/v1/chat/completions")

# --- Google Maps API Configuration ---
# IMPORTANT: Store your API Key as an environment variable
# DO NOT HARDCODE IT HERE
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

BASE_PROMPT_TEMPLATE = """You are a friendly Indian nutritionist and home chef. A user has shared how they feel, what food they have, and potentially some dietary preferences. Based on ALL this information, suggest two desi-style meals: one for lunch, one for dinner.

User input: "{user_actual_input}"
{filter_instructions}

Make sure the meals are desi and emotionally comforting.
STRICTLY Provide the output ONLY as a JSON array of two meal objects. Each object should have keys: "name", "type", "prepTime", "calories", "cost", "recipe" (as an array of strings), and "tip".
The "recipe" array should contain exactly 3 simple steps.
The "type" should be either "Lunch" or "Dinner".
The "cost" should be a string like "₹80" or "₹50-₹100".

Example of desired JSON output format:
[
  {{
    "name": "Meal 1 Name",
    "type": "Lunch",
    "prepTime": "X mins",
    "calories": "Y kcal",
    "cost": "₹Z",
    "recipe": ["Step 1 description...", "Step 2 description...", "Step 3 description..."],
    "tip": "Some relevant tip..."
  }},
  {{
    "name": "Meal 2 Name",
    "type": "Dinner",
    "prepTime": "A mins",
    "calories": "B kcal",
    "cost": "₹C",
    "recipe": ["Step 1 description...", "Step 2 description...", "Step 3 description..."],
    "tip": "Another relevant tip..."
  }}
]
"""

def parse_llm_response_to_meal_cards(llm_response_content):
    try:
        if not llm_response_content or not llm_response_content.strip():
            print("LLM response content is empty or whitespace.")
            return []
        json_start_index = llm_response_content.find('[')
        if json_start_index == -1:
            print("Could not find the start of a JSON array ('[') in the LLM response.")
            print(f"Problematic LLM response content:\n{llm_response_content}")
            return [] 
        json_end_index = -1
        open_brackets = 0
        for i in range(json_start_index, len(llm_response_content)):
            if llm_response_content[i] == '[':
                open_brackets += 1
            elif llm_response_content[i] == ']':
                open_brackets -= 1
                if open_brackets == 0:
                    json_end_index = i + 1 
                    break
        if json_end_index == -1:
            print("Could not find the matching end of the JSON array (']') in the LLM response.")
            print(f"Problematic LLM response content:\n{llm_response_content}")
            return [] 
        json_string = llm_response_content[json_start_index:json_end_index]
        print(f"Attempting to parse extracted JSON string:\n{json_string}")
        suggestions = json.loads(json_string)
        if isinstance(suggestions, list) and all(isinstance(item, dict) and 'name' in item for item in suggestions):
            for i, meal in enumerate(suggestions):
                if 'id' not in meal:
                    meal['id'] = f"meal_{i+1}_{meal.get('name', 'unknown').replace(' ', '_').lower()}"
            return suggestions
        else:
            print(f"Parsed JSON is not in the expected format. Parsed data: {suggestions}")
            return []
    except json.JSONDecodeError as e:
        print(f"Error decoding extracted JSON from LLM response: {e}")
        json_string_for_error = 'Could not extract JSON string'
        if 'json_string' in locals() and json_string: 
             json_string_for_error = json_string
        print(f"Problematic extracted JSON string:\n{json_string_for_error}")
        return [{"id": "error_parse", "name": "Error Parsing AI Response", "type": "Error","prepTime": "N/A", "calories": "N/A", "cost": "N/A","recipe": ["Could not understand the AI's meal plan."],"tip": "AI response was not valid JSON after extraction."}]
    except Exception as e:
        print(f"An unexpected error during LLM response parsing: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return []

@app.route('/api/getMeals', methods=['POST'])
def get_meals_route():
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "Request body must be JSON."}), 400
        user_input = data.get('query')
        filters = data.get('filters', {}) 
        if not user_input: return jsonify({"error": "No query provided."}), 400

        filter_instruction_parts = []
        if filters.get('pcosMode'): filter_instruction_parts.append("PCOS-safe (no dairy, low-GI, avoid processed sugars/refined carbs, focus on whole grains, lean protein).")
        if filters.get('vegetarian'): filter_instruction_parts.append("Vegetarian (no meat, poultry, fish). If suggesting eggs, mark as optional.")
        if filters.get('keto'): filter_instruction_parts.append("Keto-friendly (very low carb, high fat, moderate protein).")
        if filters.get('jain'): filter_instruction_parts.append("Jain (strictly vegetarian, no root vegetables like onion, garlic, potatoes, carrots, etc.).")
        
        budget_filter = filters.get('budget')
        if budget_filter:
            budget_map = {
                'under50': "under ₹50.", '50-100': "between ₹50-₹100.",
                '100-200': "between ₹100-₹200.", 'over200': "over ₹200 (aim for value)."
            }
            if budget_filter in budget_map:
                 filter_instruction_parts.append(f"Meal cost ideally {budget_map[budget_filter]}")
        
        allergies_list = filters.get('allergies') 
        if allergies_list and isinstance(allergies_list, list) and len(allergies_list) > 0:
            filter_instruction_parts.append(f"MUST AVOID allergens: {', '.join(allergies_list)}.")
        
        filter_instructions_string = ""
        if filter_instruction_parts:
            filter_instructions_string = "\nIMPORTANT DIETARY PREFERENCES & CONSTRAINTS (Adhere strictly):\n- " + "\n- ".join(filter_instruction_parts)
        
        print(f"Applied filter instructions: {filter_instructions_string}")
        full_prompt = BASE_PROMPT_TEMPLATE.format(user_actual_input=user_input, filter_instructions=filter_instructions_string)
        print(f"\n--- Full Prompt to LLM ---\n{full_prompt}\n---------------------------\n")

        payload = {"model": "loaded_model", "messages": [{"role": "system", "content": "Follow user instructions for output format and ALL dietary constraints."}, {"role": "user", "content": full_prompt}],"temperature": 0.7,"max_tokens": 1500}
        
        print(f"Sending payload to LM Studio: {json.dumps(payload, indent=2)}")
        lm_studio_response = requests.post(LM_STUDIO_URL, json=payload, timeout=120) 
        lm_studio_response.raise_for_status() 
        response_data = lm_studio_response.json()
        print(f"Received response from LM Studio: {json.dumps(response_data, indent=2)}")
        llm_content = response_data.get('choices', [{}])[0].get('message', {}).get('content', '')

        if not llm_content:
            print("LLM response content is empty.")
            return jsonify({"suggestions": [], "error": "AI did not return any content."}), 500

        meal_suggestions = parse_llm_response_to_meal_cards(llm_content)
        if not meal_suggestions:
            error_message = "Failed to parse AI response or AI response was not valid meal data."
            if isinstance(meal_suggestions, list) and len(meal_suggestions) == 1 and meal_suggestions[0].get("id") == "error_parse":
                 error_message = meal_suggestions[0]["tip"]
            return jsonify({"suggestions": [], "error": error_message}), 500
        return jsonify({"suggestions": meal_suggestions})

    except requests.exceptions.Timeout:
        print(f"Timeout error calling LM Studio at {LM_STUDIO_URL}")
        return jsonify({"error": "The AI model server timed out."}), 504 
    except requests.exceptions.RequestException as e:
        print(f"Network error calling LM Studio: {e}")
        return jsonify({"error": f"Could not connect to AI model server. Is LM Studio running? Details: {str(e)}"}), 503
    except Exception as e:
        print(f"An error occurred on the backend: {e}")
        print(f"Traceback: {traceback.format_exc()}") 
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500

# --- NEW ROUTE for Google Maps Places API ---
@app.route('/api/findRestaurants', methods=['POST'])
def find_restaurants_route():
    if not GOOGLE_MAPS_API_KEY:
        print("ERROR: GOOGLE_MAPS_API_KEY environment variable is not set.")
        return jsonify({"error": "Server configuration error: Maps API key is missing."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400
        
        meal_name = data.get('mealName')
        # For now, we'll hardcode the location to Patna.
        # Later, we could get this from user input or browser geolocation.
        location = "Patna, Bihar" 
        query = f"{meal_name} restaurants in {location}"

        if not meal_name:
            return jsonify({"error": "No mealName provided."}), 400

        print(f"Searching Google Places for: {query}")

        params = {
            'query': query,
            'key': GOOGLE_MAPS_API_KEY,
            'fields': 'name,formatted_address,rating,user_ratings_total,opening_hours,photos,place_id' # Request specific fields
        }

        response = requests.get(GOOGLE_PLACES_API_URL, params=params, timeout=10)
        response.raise_for_status() # Raise an exception for HTTP errors

        places_data = response.json()
        print(f"Received response from Google Places API: {json.dumps(places_data, indent=2)}")

        restaurants = []
        if places_data.get("results"):
            for place in places_data["results"][:3]: # Get top 3 results
                restaurants.append({
                    "name": place.get("name"),
                    "address": place.get("formatted_address"),
                    "rating": place.get("rating", "N/A"),
                    "user_ratings_total": place.get("user_ratings_total", 0),
                    "place_id": place.get("place_id") # Useful for getting more details or linking to map
                    # We could potentially add photos later if needed
                })
        
        return jsonify({"restaurants": restaurants})

    except requests.exceptions.Timeout:
        print(f"Timeout error calling Google Places API.")
        return jsonify({"error": "Could not reach restaurant search service (timeout)."}), 504
    except requests.exceptions.RequestException as e:
        print(f"Error calling Google Places API: {e}")
        return jsonify({"error": f"Error searching for restaurants: {str(e)}"}), 503
    except Exception as e:
        print(f"An error occurred in findRestaurants route: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"An internal server error occurred while finding restaurants: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

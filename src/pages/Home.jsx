// src/pages/Home.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import ChatInput from '../components/ChatInput';
import MealCard from '../components/MealCard';

// New component to display a single restaurant
function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;
  const zomatoSearchUrl = `https://www.zomato.com/patna/search?q=${encodeURIComponent(restaurant.name)}`;

  return (
    <div className="bg-amber-50 p-4 rounded-lg shadow border border-amber-200">
      <h4 className="text-md font-semibold text-amber-800">{restaurant.name}</h4>
      <p className="text-xs text-gray-600">{restaurant.address}</p>
      <p className="text-xs text-gray-500">Rating: {restaurant.rating} ({restaurant.user_ratings_total} reviews)</p>
      <a 
        href={zomatoSearchUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-2 inline-block bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors"
      >
        Order on Zomato
      </a>
    </div>
  );
}


function Home() {
  // Meal suggestion states
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [mealError, setMealError] = useState(null);

  // Filter states
  const [isPCOSMode, setIsPCOSMode] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [budget, setBudget] = useState(''); 
  const [allergiesInput, setAllergiesInput] = useState('');
  const [isKeto, setIsKeto] = useState(false); 
  const [isJain, setIsJain] = useState(false); 

  // Restaurant search states
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [restaurantResults, setRestaurantResults] = useState([]);
  const [restaurantError, setRestaurantError] = useState(null);
  const [selectedMealForRestaurants, setSelectedMealForRestaurants] = useState(null);


  const fetchMealSuggestions = async (userInput, currentFilters) => {
    console.log("Home sending for meals:", userInput, currentFilters);
    setIsLoadingMeals(true);
    setMealSuggestions([]);
    setMealError(null); 
    setRestaurantResults([]); // Clear restaurant results when new meals are fetched
    setSelectedMealForRestaurants(null); // Clear selected meal

    try {
      const response = await fetch('http://localhost:5001/api/getMeals', { 
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query: userInput, filters: currentFilters }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch meals.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); 
      setMealSuggestions(data.suggestions || []); 
    } catch (err) {
      console.error("Error fetching meal suggestions:", err);
      setMealError(err.message || 'An unexpected error occurred.');
      setMealSuggestions([]); 
    } finally {
      setIsLoadingMeals(false); 
    }
  };

  const handleFindRestaurants = async (mealName) => {
    console.log("Finding restaurants for:", mealName);
    setSelectedMealForRestaurants(mealName);
    setIsLoadingRestaurants(true);
    setRestaurantResults([]);
    setRestaurantError(null);

    try {
      const response = await fetch('http://localhost:5001/api/findRestaurants', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mealName: mealName })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to find restaurants.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRestaurantResults(data.restaurants || []);
    } catch (err) {
      console.error("Error finding restaurants:", err);
      setRestaurantError(err.message || 'Could not find restaurants.');
      setRestaurantResults([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const handleChatSubmit = (userInput) => {
    const currentFilters = {
      pcosMode: isPCOSMode, vegetarian: isVegetarian, keto: isKeto, jain: isJain,
      budget: budget,
      allergies: allergiesInput.split(',').map(a => a.trim()).filter(a => a !== ''),
    };
    fetchMealSuggestions(userInput, currentFilters);
  };

  const budgetOptions = [
    { value: '', label: 'Any Budget' }, { value: 'under50', label: 'Under ₹50' },
    { value: '50-100', label: '₹50 - ₹100' }, { value: '100-200', label: '₹100 - ₹200' },
    { value: 'over200', label: 'Over ₹200' },
  ];

  return (
    <div className="min-h-screen bg-gray-100"> {/* Slightly different background */}
      <Header />
      <main className="container mx-auto p-4 mt-8">
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6"> {/* Enhanced shadow */}
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter Your Meal Ideas:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end"> {/* items-end for alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Focus</label>
              <button onClick={() => setIsPCOSMode(!isPCOSMode)} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${isPCOSMode ? 'bg-pink-500 text-white' : 'bg-gray-200 hover:bg-pink-100'}`}>🌸 PCOS-Safe {isPCOSMode && '(Active)'}</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferences</label>
              <button onClick={() => setIsVegetarian(!isVegetarian)} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${isVegetarian ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-green-100'}`}>🥗 Vegetarian {isVegetarian && '(Active)'}</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diet Types</label>
              <button onClick={() => setIsKeto(!isKeto)} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${isKeto ? 'bg-indigo-500 text-white' : 'bg-gray-200 hover:bg-indigo-100'}`}>🥑 Keto {isKeto && '(Active)'}</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-gray-100 hidden sm:block">.</label> {/* Spacer for alignment */}
              <button onClick={() => setIsJain(!isJain)} className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${isJain ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-yellow-100'}`}>🧘 Jain {isJain && '(Active)'}</button>
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget (per meal)</label>
              <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                {budgetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1"> {/* Adjusted span for allergies */}
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma-separated)</label>
              <input type="text" id="allergies" value={allergiesInput} onChange={(e) => setAllergiesInput(e.target.value)} placeholder="e.g., peanuts, soy" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm"/>
            </div>
          </div>
        </div>

        <ChatInput onSubmitQuery={handleChatSubmit} isLoading={isLoadingMeals} />

        {isLoadingMeals && <div className="text-center mt-8"><p className="text-xl text-emerald-600 animate-pulse">🤖 Buddy is thinking of some yummy meals for you...</p></div>}
        {mealError && !isLoadingMeals && <div className="mt-8 text-center p-4 bg-red-100 text-red-700 rounded-md shadow"><p className="font-semibold">Oops! Meal Error:</p><p>{mealError}</p></div>}

        {!isLoadingMeals && !mealError && mealSuggestions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Meal Ideas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mealSuggestions.map((meal) => (
                <MealCard key={meal.id || meal.name} meal={meal} onFindRestaurants={handleFindRestaurants} />
              ))}
            </div>
          </div>
        )}
        
        {!isLoadingMeals && !mealError && mealSuggestions.length === 0 && (
           <div className="text-center mt-8 text-gray-500 py-10"><p className="text-lg">No meal suggestions yet. Try typing above or adjust your filters!</p></div>
        )}

        {/* Restaurant Results Section */}
        {selectedMealForRestaurants && (
          <div className="mt-10 pt-6 border-t-2 border-emerald-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Restaurants near Patna for <span className="text-emerald-600">{selectedMealForRestaurants}</span>:</h3>
            {isLoadingRestaurants && <p className="text-amber-600 animate-pulse">Searching for restaurants...</p>}
            {restaurantError && !isLoadingRestaurants && <div className="p-3 bg-red-100 text-red-600 rounded-md"><p className="font-semibold">Restaurant Search Error:</p><p>{restaurantError}</p></div>}
            {!isLoadingRestaurants && !restaurantError && restaurantResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                {restaurantResults.map(resto => <RestaurantCard key={resto.place_id} restaurant={resto} />)}
              </div>
            )}
            {!isLoadingRestaurants && !restaurantError && restaurantResults.length === 0 && (
              <p className="text-gray-500 mt-3">No restaurants found for this meal nearby, or couldn't fetch details.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;

// src/components/MealCard.jsx
import React from 'react';

// Component to display a single meal suggestion.
// It now accepts an 'onFindRestaurants' function prop.
function MealCard({ meal, onFindRestaurants }) {
  if (!meal) {
    return null; 
  }

  const handleFindClick = () => {
    if (onFindRestaurants) {
      onFindRestaurants(meal.name); // Pass the meal name to the handler
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6 border border-gray-200 flex flex-col justify-between">
      <div> {/* Content wrapper */}
        <h2 className="text-2xl font-bold text-emerald-700 mb-3">{meal.name}</h2>
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <p><span className="font-semibold">Calories:</span> {meal.calories} kcal</p>
          <p><span className="font-semibold">Est. Cost:</span> {meal.cost}</p>
        </div>
        <div className="mb-3">
          <h3 className="text-md font-semibold text-gray-700 mb-1">Recipe (3 simple steps):</h3>
          <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
            {meal.recipe && meal.recipe.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="mt-3 text-sm text-emerald-800 p-3 bg-emerald-50 rounded-md">
          <span className="font-semibold">💡 Desi Tip:</span> {meal.tip}
        </div>
      </div>

      {/* "Find near me" button */}
      <div className="mt-4 pt-4 border-t border-gray-200"> {/* Added a top border for separation */}
        <button
          onClick={handleFindClick}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-150 text-sm"
        >
          📍 Find near me
        </button>
      </div>
    </div>
  );
}

export default MealCard;

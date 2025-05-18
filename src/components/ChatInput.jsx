// src/components/ChatInput.jsx
import React, { useState } from 'react';

// Component for the user input area.
// It now accepts 'onSubmitQuery' and 'isLoading' as props.
function ChatInput({ onSubmitQuery, isLoading }) {
  const [userInput, setUserInput] = useState('');

  // Function to handle form submission.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return; // Prevent submission if input is empty or already loading

    onSubmitQuery(userInput); // Call the function passed from Home.jsx
    // setUserInput(''); // Optionally clear input after submission - might be better to leave it for now
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-white p-6 rounded-lg shadow-xl">
      <label htmlFor="moodInput" className="block text-lg font-medium text-gray-700 mb-2">
        How are you feeling today? What's in your fridge?
      </label>
      <textarea
        id="moodInput"
        rows="4"
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-colors duration-150"
        placeholder="e.g., Sad and tired, have some bhindi and roti..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        disabled={isLoading} // Disable textarea while loading
        required
      />
      <button
        type="submit"
        className={`mt-4 w-full font-semibold py-3 px-4 rounded-md shadow-md transition-colors duration-150
                    ${isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? 'Buddy is Thinking...' : 'Get Meal Ideas ✨'}
      </button>
    </form>
  );
}

export default ChatInput;

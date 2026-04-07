import { useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (ingredients.trim() === "") {
      alert("Please enter some ingredients");
      return;
    }

    setLoading(true);
    setRecipe("");

    const API_KEY=process.env.REACT_APP_GEMINI_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `I have these ingredients: ${ingredients}. 
              Please suggest a detailed recipe with:
              1. Recipe Name
              2. Ingredients needed
              3. Step by step cooking instructions
              4. Cooking time
              5. Serving size`
            }]
          }]
        })
      });

      const data = await response.json();
      console.log("Full API response:", data);

      if (data.candidates && data.candidates[0]) {
        const text = data.candidates[0].content.parts[0].text;
        setRecipe(text);
      } else if (data.error) {
        setRecipe("API Error: " + data.error.message);
      } else {
        setRecipe("No recipe found. Please try again.");
      }

    } catch (error) {
      setRecipe("Network error: " + error.message);
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      
      <h1>🍳 AI Recipe Generator</h1>
      <p className="subtitle">Enter ingredients and get AI powered recipes!</p>

      <div className="input-section">
        <textarea
          placeholder="Enter ingredients... (e.g. chicken, tomato, onion, garlic)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={4}
        />
        <div className="tag-row">
      <span className="tag" onClick="adding ('chicken')">+ chicken</span>
      <span className="tag" onClick="adding ('tomato')">+ tomato</span>
      <span className="tag" onClick="adding ('onion')">+ onion</span>
      <span className="tag" onClick="adding ('garlic')">+ garlic</span>
      <span className="tag" onClick="adding ('cheese')">+ cheese</span>
      <span className="tag" onClick="adding ('lemon')">+ lemon</span>
      <span className="tag" onClick="adding ('spinach')">+ spinach</span>
      <span className="tag" onClick="adding ('rice')">+ rice</span>
      <span className="tag" onClick="adding ('eggs')">+ eggs</span>
      <span className="tag" onClick="adding ('mushroom')">+ mushroom</span>
    </div>
        <button onClick={generateRecipe} disabled={loading}>
          {loading ? '🤖 Generating Recipe...' : '✨ Generate Recipe'}
        </button>
      </div>
      
      {recipe && (
        <div className="recipe-card">
          <h2>🍽️ Your Recipe:</h2>
          <pre>{recipe}</pre>
        </div>
      )}
     

    </div>
   
  );
}

export default App;

// Grab references to the HTML elements.
document
  .getElementById("aiRecipeForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("recipeInput").value;
    const recipeContainer = document.getElementById("generatedRecipe");

    // Show a loading message
    recipeContainer.innerHTML =
      '<p class="text-center text-gray-500 animate-fadeIn">Generating recipe...</p>';

    // Construct payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Generate a detailed recipe in plain text with clear sections and step-by-step instructions based on these ingredients or meal type: ${query}`,
            },
          ],
        },
      ],
    };

    fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCDxnEe8R3-9eCuV-PX45CB6Bf_zosJpeU",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Gemini API response:", data);
        // Extract the generated text from the response.
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          // Split the text into sections using double newline as delimiter.
          const sections = generatedText.split("\n\n");
          const htmlOutput = sections
            .map((section) => {
              const text = section.trim();
              // If the section is for ingredients:
              if (text.toLowerCase().startsWith("ingredients:")) {
                const items = text
                  .replace(/ingredients:/i, "")
                  .trim()
                  .split("\n")
                  .filter((item) => item.trim() !== "");
                const itemsHtml = items
                  .map((item) => `<li>${item.trim()}</li>`)
                  .join("");
                return `
                  <h3 class="font-bold text-xl text-gray-700 mb-2">Ingredients</h3>
                  <ul class="list-disc ml-6 space-y-1 text-gray-700">${itemsHtml}</ul>
                `;
              }
              // If the section is for instructions:
              else if (text.toLowerCase().startsWith("instructions:")) {
                const steps = text
                  .replace(/instructions:/i, "")
                  .trim()
                  .split("\n")
                  .filter((step) => step.trim() !== "");
                const stepsHtml = steps
                  .map((step) => `<li class="mb-2">${step.trim()}</li>`)
                  .join("");
                return `
                  <h3 class="font-bold text-xl text-gray-700 mb-2">Instructions</h3>
                  <ol class="list-decimal ml-6 space-y-1 text-gray-700">${stepsHtml}</ol>
                `;
              }
              // If the section is a heading (e.g., "## Classic Beef Bourguignon")
              else if (text.match(/^##\s+/)) {
                return `<h2 class="font-bold text-3xl text-gray-800 mb-4">${text.replace(
                  /^##\s+/,
                  ""
                )}</h2>`;
              }
              // Otherwise, treat it as a paragraph.
              else {
                return `<p class="mb-4 text-gray-700 leading-relaxed">${text}</p>`;
              }
            })
            .join("");

          recipeContainer.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-xl animate-fadeIn">
              ${htmlOutput}
              <div class="mt-6 text-center">
                <button id="saveRecipeBtn" class="bg-indigo-500 text-white px-6 py-3 rounded-full hover:bg-indigo-600 transition duration-300 shadow-lg">
                  Save Recipe
                </button>
              </div>
            </div>
          `;

          // Add event listener for the Save Recipe button.
          document
            .getElementById("saveRecipeBtn")
            .addEventListener("click", () => {
              saveRecipe({
                query: query,
                generatedText: generatedText,
                htmlOutput: htmlOutput,
                timestamp: new Date().toISOString(),
              });
            });
        } else {
          recipeContainer.innerHTML =
            '<p class="text-center text-red-500 animate-fadeIn">No recipe generated.</p>';
        }
      })
      .catch((err) => {
        console.error(err);
        recipeContainer.innerHTML =
          '<p class="text-center text-red-500 animate-fadeIn">Error generating recipe. Please try again.</p>';
      });
  });

// Function to save a recipe to localStorage.
function saveRecipe(recipe) {
  let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  // Check if the recipe already exists by comparing query and generated text.
  if (
    !savedRecipes.some(
      (r) =>
        r.query === recipe.query && r.generatedText === recipe.generatedText
    )
  ) {
    savedRecipes.push(recipe);
    localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
    alert("Recipe saved!");
  } else {
    alert("Recipe already saved!");
  }
}
let savedRecipesShown = false;

document.getElementById("viewSavedRecipesBtn").addEventListener("click", () => {
  const recipeContainer = document.getElementById("generatedRecipe");
  const viewBtn = document.getElementById("viewSavedRecipesBtn");

  if (savedRecipesShown) {
    // Hide the saved recipes: clear the container and update button text.
    recipeContainer.innerHTML = "";
    savedRecipesShown = false;
    viewBtn.textContent = "View Saved Recipes";
  } else {
    // Retrieve saved recipes from localStorage.
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
    if (savedRecipes.length === 0) {
      recipeContainer.innerHTML =
        '<p class="text-center text-gray-500">No saved recipes yet.</p>';
    } else {
      let html =
        '<h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Saved Recipes</h2>';
      savedRecipes.forEach((recipe) => {
        html += `
          <div class="bg-white p-6 rounded-lg shadow-xl mb-4">
            <p class="text-sm text-gray-500 mb-2">Saved on: ${new Date(
              recipe.timestamp
            ).toLocaleString()}</p>
            <div>${recipe.htmlOutput}</div>
          </div>
        `;
      });
      recipeContainer.innerHTML = html;
    }
    savedRecipesShown = true;
    viewBtn.textContent = "Back to Recipe Generator";
  }
});

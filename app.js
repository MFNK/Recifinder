// Grab references to the HTML elements.
const searchBtn = document.getElementById("searchBtn");
const ingredientInput = document.getElementById("ingredientInput");
const results = document.getElementById("results");
const viewFavoritesBtn = document.getElementById("viewFavoritesBtn");

// Function to add a recipe to favorites (stored in localStorage).
function addToFavorites(recipe) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some((fav) => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("Added to favorites!");
  } else {
    alert("Recipe is already in favorites!");
  }
}

// Function to load recipes based on the search input.
function loadRecipes() {
  results.innerHTML =
    '<p class="text-center text-gray-500 col-span-full">Loading...</p>';
  const ingredients = ingredientInput.value;
  const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
    ingredients
  )}&number=100&apiKey=69ad25fd267e46a9bdd2e14b5212cccf`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      results.innerHTML = "";
      data.forEach((recipe) => {
        // Create a card for each recipe with improved UI styling and transitions.
        const card = document.createElement("div");
        card.className =
          "bg-white p-6 rounded-lg shadow-xl text-center space-y-4 cursor-pointer hover:shadow-2xl transition transform hover:scale-105";
        card.innerHTML = `
          <h2 class="font-bold text-lg text-gray-800">${recipe.title}</h2>
          <img src="${recipe.image}" alt="${recipe.title}" class="w-full rounded mt-2">
        `;
        // On click, fetch detailed recipe information.
        card.addEventListener("click", () => {
          fetch(
            `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=69ad25fd267e46a9bdd2e14b5212cccf`
          )
            .then((res) => res.json())
            .then((details) => {
              // Split instructions into sentences and create list items.
              const instructionSteps = details.instructions
                ? details.instructions
                    .split(/(?:\.\s+|\n)/)
                    .filter((step) => step.trim() !== "")
                    .map((step) => `<li>${step.trim()}.</li>`)
                    .join("")
                : "<li>No instructions available.</li>";

              // Show the detailed view in a modal overlay with fade-in animation.
              results.innerHTML = `
                <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg text-left space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
                  <div class="flex items-center mb-4">
                    <button id="backBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">&larr; Back to recipes</button>
                    <button id="favoriteBtn" class="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Add to Favorites</button>
                  </div>
                  <h2 class="font-bold text-3xl text-gray-800 mb-4">${
                    details.title
                  }</h2>
                  <img src="${details.image}" alt="${
                details.title
              }" class="w-full rounded mb-4">
                  <div>
                    <h3 class="font-bold text-xl text-gray-700 mb-2">Ingredients:</h3>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700">
                      ${details.extendedIngredients
                        .map((ing) => `<li>${ing.original}</li>`)
                        .join("")}
                    </ul>
                  </div>
                  <div>
                    <h3 class="font-bold text-xl text-gray-700 mb-2">Instructions:</h3>
                    <ol class="list-decimal ml-6 space-y-1 marker:font-bold text-gray-700">
                      ${instructionSteps}
                    </ol>
                  </div>
                </div>
              `;
              // Back button returns to the search results.
              document
                .getElementById("backBtn")
                .addEventListener("click", loadRecipes);
              // Add recipe to favorites.
              document
                .getElementById("favoriteBtn")
                .addEventListener("click", () => {
                  addToFavorites(details);
                });
            })
            .catch((err) =>
              console.error("Error fetching recipe details:", err)
            );
        });
        results.appendChild(card);
      });
    })
    .catch((error) => {
      results.innerHTML =
        '<p class="text-center text-red-500 col-span-full">Error loading recipes</p>';
      console.error("Error fetching recipes:", error);
    });
}

// Event listener for the Search button.
searchBtn.addEventListener("click", loadRecipes);

// Event listener for the "View Favorites" button.
let favoritesShown = false;

viewFavoritesBtn.addEventListener("click", () => {
  if (favoritesShown) {
    // If favorites are currently shown, clear the results and update the button text.
    results.innerHTML = "";
    favoritesShown = false;
    viewFavoritesBtn.textContent = "View Favorites";
  } else {
    // Show favorites.
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.length === 0) {
      results.innerHTML =
        '<p class="text-center text-gray-500 col-span-full">No favorites added yet.</p>';
      favoritesShown = true;
      viewFavoritesBtn.textContent = "Back to Search";
      return;
    }

    favorites.forEach((recipe) => {
      const card = document.createElement("div");
      card.className =
        "bg-white p-6 rounded-lg shadow-xl text-center space-y-4 cursor-pointer hover:shadow-2xl transition transform hover:scale-105";
      card.innerHTML = `
        <h2 class="font-bold text-lg text-gray-800">${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}" class="w-full rounded mt-2">
      `;
      // Clicking a favorite card shows its detailed view.
      card.addEventListener("click", () => {
        results.innerHTML = `
          <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg text-left space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button id="backFavBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-4">&larr; Back to search</button>
            <h2 class="font-bold text-3xl text-gray-800 mb-4">${
              recipe.title
            }</h2>
            <img src="${recipe.image}" alt="${
          recipe.title
        }" class="w-full rounded mb-4">
            <div>
              <h3 class="font-bold text-xl text-gray-700 mb-2">Ingredients:</h3>
              <ul class="list-disc mx-auto text-gray-700 space-y-1">
                ${
                  recipe.extendedIngredients
                    ? recipe.extendedIngredients
                        .map((ing) => `<li>${ing.original}</li>`)
                        .join("")
                    : "<li>No ingredients available.</li>"
                }
              </ul>
            </div>
            <div>
              <h3 class="font-bold text-xl text-gray-700 mb-2">Instructions:</h3>
              <ol class="list-decimal mx-auto text-gray-700 space-y-1 marker:font-bold">
                ${
                  recipe.instructions
                    ? recipe.instructions
                        .split(/(?:\.\s+|\n)/)
                        .filter((step) => step.trim() !== "")
                        .map((step) => `<li>${step.trim()}.</li>`)
                        .join("")
                    : "<li>No instructions available.</li>"
                }
              </ol>
            </div>
          </div>
        `;
        document.getElementById("backFavBtn").addEventListener("click", () => {
          viewFavoritesBtn.click();
        });
      });
      results.appendChild(card);
    });
    favoritesShown = true;
    viewFavoritesBtn.textContent = "Back to Search";
  }
});

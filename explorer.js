let categoryTitle = document.getElementById("categoryTitle");
const category = document.getElementById("category");
const loadingState = document.getElementById("alert");
const container = document.getElementById("recipeContainer");
const loadMore = document.getElementById("loadMore");
const modal = document.getElementById("recipeModal");
let recipeTitle = document.getElementById("recipeTitle");
const close = document.getElementById("close");
const modalContent = document.getElementById("modalContent");

let recipes = [];

let displayedRecipes = 6;
let recipesPerLoad = 6;

document.addEventListener("DOMContentLoaded", function () {
  let selectedCategory = category.value;
  categoryTitle = `${selectedCategory} Recipes `;
  fetchRecipes(selectedCategory);
});

async function fetchRecipes(selectedCategory) {
  loadingState.textContent = "Loading recipes...";
  container.innerHTML = "";
  loadMore.classList.add("hidden");

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }
    const data = await response.json();
    recipes = data.meals || [];
    displayRecipes(recipes.slice(0, displayedRecipes));
    loadingState.classList.add("hidden");
    if (recipes.length > displayedRecipes) {
      loadMore.classList.remove("hidden");
    }
  } catch (err) {
    loadingState.textContent = err.message;
  }
}

category.addEventListener("change", function () {
  let selectedCategory = category.value;
  categoryTitle = `${selectedCategory} Recipes `;
  fetchRecipes(selectedCategory);
});

function displayRecipes(recipiesToDisplay) {
  container.innerHTML = "";

  if (recipiesToDisplay.length === 0) {
    container.innerHTML = "No recipes found";
    return;
  }

  recipiesToDisplay.forEach(function (recipe) {
    const recipeCard = document.createElement("section");
    const recipeImage = document.createElement("img");

    recipeCard.className =
      "rounded-2xl border-slate-300 group bg-white shadow-sm transition duration-300 hover:shadow-xl hover:-translate-y-1";
    recipeImage.src = recipe.strMealThumb;
    recipeImage.alt = recipe.strMeal;
    recipeImage.className =
      "object-cover w-full h-48 transition duration-300 group-hover:scale-105";

    const viewRecipe = document.createElement("button");
    viewRecipe.textContent = "View Recipe";
    viewRecipe.type = "button";
    viewRecipe.className =
      "view-recipe-btn w-full rounded-xl bg-[#023047] py-3 text-sm text-white font-semibold transition hover:bg-[#023047]/90 cursor-pointer";
    viewRecipe.dataset.id = recipe.idMeal;
    viewRecipe.addEventListener("click", function () {
      fetchRecipeDetails(recipe.idMeal);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "overflow-hidden rounded-t-xl";
    wrapper.appendChild(recipeImage);

    const cardContent = document.createElement("div");
    cardContent.className = "p-5 rounded-xl hover:";

    const cardTitle = document.createElement("h3");
    cardTitle.textContent = recipe.strMeal;
    cardTitle.className =
      "mb-4 min-h-14 text-lg font-bold leading-tight text-slate-800";

    cardContent.append(cardTitle, viewRecipe);
    recipeCard.append(wrapper, cardContent);
    container.appendChild(recipeCard);
  });
}

loadMore.addEventListener("click", function () {
  displayedRecipes += recipesPerLoad;
  displayRecipes(recipes.slice(0, displayedRecipes));

  if (displayedRecipes >= recipes.length) {
    loadMore.classList.add("hidden");
  }
});

function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

close.addEventListener("click", closeModal);
modal.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

async function fetchRecipeDetails(recipeId) {
  openModal();
  modalContent.innerHTML =
    '<p class="text-sm text-slate-500 text-center p-4 m-4">Loading recipe details...</p>';

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`,
    );

    if (!response.ok) {
      throw new Error("Failed to load recipe details");
    }

    const data = await response.json();
    console.log(data);
    if (!data.meals || data.meals.length === 0) {
      throw new Error("Recipe not found");
    }

    displayRecipeDetails(data.meals[0]);
  } catch (err) {
    console.log(err.message);
    modalContent.textContent =
      "Unable to load this recipe. Please try again later.";
  }
}

function displayRecipeDetails(recipe) {
  modalContent.innerHTML = "";
  recipeTitle.textContent = recipe.strMeal;
  const image = document.createElement("img");
  image.src = recipe.strMealThumb;
  image.alt = recipe.strMeal;
  image.className = "w-full max-h-70 rounded-2xl object-cover";

  const mealCategory = document.createElement("p");
  mealCategory.className = "text-sm text-slate-500";
  mealCategory.textContent = `Category: ${recipe.strCategory}`;

  const cusine = document.createElement("p");
  cusine.className = "text-sm text-slate-500";
  cusine.textContent = `Cusine: ${recipe.strArea}`;
  const mealDesc = document.createElement("div");
  mealDesc.className = "flex gap-6";

  const ingredientsHeading = document.createElement("h2");
  ingredientsHeading.className = "font-bold text-2xl text-slate-800 my-3";
  ingredientsHeading.textContent = "Ingredients";

  const ingredientsList = document.createElement("ul");
  ingredientsList.className = "grid grid-cols-2 gap-6";

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      const listItem = document.createElement("li");
      listItem.textContent = `${measure} ${ingredient}`;
      listItem.className = "text-sm text-slate-500";
      ingredientsList.appendChild(listItem);
    }
  }

  const instructionsHeading = document.createElement("h2");
  instructionsHeading.className = "font-bold text-2xl text-slate-800 my-3";
  instructionsHeading.textContent = "Cooking Instructions";

  const instructions = document.createElement("p");
  instructions.className = "text-slate-500 whitespace-pre-line leading-7";
  instructions.textContent = recipe.strInstructions;

  mealDesc.append(mealCategory, "-", cusine);
  modalContent.append(
    image,
    mealDesc,
    ingredientsHeading,
    ingredientsList,
    instructionsHeading,
    instructions,
  );
}

const tabs = ['Public Recipes', 'My Recipes'];
let selectedTab = 0;
let currentPage = 1;
let itemsPerPage = 5;
let recipes = [];
let myRecipes = [];
let publicSearch = [];
let myRecipeSearch = [];
let myFilterRecipes = [];
document.addEventListener("DOMContentLoaded", () => {
    renderTabs();
    fetchPublicRecipes();
});



/*used to type animated text on the header background */
var typed = new Typed('.auto-type', {
    strings: [" 🍳 Welcome 👋 to My Kitchen 🍽️"],
    typeSpeed: 19,
    startDelay: 2000,
    showCursor: false,
    onComplete: function () {
        moreDesctoWelcome()
    }
});


function moreDesctoWelcome() {
    const moreDesctoWelcome_content =
        ` 
        <p id="auto-desc" class="auto-desc">
        <span class="st"> <span class="emoji">🌟</span> Step into a world where flavors dance and aromas enchant – welcome to My Kitchen, where every recipe is a journey and every dish tells a story. We're delighted to have you here, ready to embark on a culinary adventure like no other.
        </span>
        <span class="st"><span class="emoji">🍲</span> At My Kitchen, we're more than just a collection of recipes; we're a community of food enthusiasts, passionate about sharing the joy of cooking. Whether you're a seasoned chef or a kitchen newbie, our diverse array of recipes caters to every taste, skill level, and craving.
        </span>
        <span class="st"><span class="emoji">👩‍🍳</span> Explore our carefully selection of dishes, from quick and easy weeknight dinners to desserts that celebrate life's sweet moments. Our step-by-step guides ensure that every recipe is not just a set of instructions but a personal cooking experience..
        </span>
        <span class="st"><span class="emoji">🍽️</span> Join us in celebrating the art of cooking, because in My Kitchen, every meal is an opportunity to create something extraordinary. Get ready to embark on a culinary journey that tantalizes your taste buds and inspires your inner chef.</span>
        `;
    document.getElementById("auto-type-p").innerHTML = moreDesctoWelcome_content;
}


/*get all recipes from remote and draw it on the screen*/
async function fetchPublicRecipes() {
    try {
        const response = await fetch('https://dummyjson.com/recipes');
        const data = await response.json();
        recipes = data.recipes;
        renderRecipes(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

/* first check on the left side filters and sort */
function sortRecipes() {
    const sortOrder = document.getElementById("sortDropdown").value;
    /* in case the current tab is public recipes and thair is no sorting order*/
    if (sortOrder == 'none' && selectedTab === 0) {

        /*check if there is result returned from search or not */

        /*if the current recipes not result of search return all fetched recipes*/
        if (publicSearch.length == 0) {
            return recipes;
        }
        /*if the current recipes are result of search return this result of search in public recipes */
        else {
            return publicSearch;
        }
    }
    /* in case the current tab is my recipes and thair is no sorting order */
    else if (sortOrder == 'none' && selectedTab === 1) {
        /*if the current recipes not result of search return recipes saved locally*/
        if (myRecipeSearch.length == 0) {
            return myRecipes;
        }
        /*if the current recipes are result of search return this result of search in my recipes */
        else {
            return myRecipeSearch;
        }
    }
    /*in case there is a sort oreder */
    else {
        /*chech first on the selected tab if it public recipes or my recipes */
        if (selectedTab === 0) {
            /*if there was no search result before sort the fetched recipes*/
            if (publicSearch.length == 0) {
                return recipes.sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

            }
            /*if there was a search result before sort this result search*/
            else {
                return publicSearch.sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

            }
        }
        /*in case the selected tab i my recipes*/
        else {
            /*if there was no search result before sort myRecipes list recipes stored locally*/
            if (myRecipeSearch.length == 0) {
                return myRecipes.sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
            }
            /*if there was a search result before sort this result search*/
            else {
                return myRecipeSearch.sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
            }
        }
    }
}
/*second check */
function filterByType(filteredList) {
    /*this function regarded the second phase of filteration*/
    /* take the result of first filter and then check if there is a filter on recipe type or not */
    const selectedType = document.getElementById("recipeTypeDropdown").value;
    /*in case there is no filter by type return the list you take as a parameter*
    /*else apply the filter then return the result to the third phase*/
    return selectedType === "all" ? filteredList : filteredList.filter(recipe => recipe.mealType[0].toLowerCase() === selectedType);


}

/*third check */
function updateRecipesPerPage(filteredList) {

    /* third and last phase in filteration*/
    /*get the selected number of recipes per page and change it to int*/
    const newLimit = parseInt(document.getElementById("recipesPerPageInput").value, 10);
    /*check there is a value and the minimum value is 5 per page */
    if (!isNaN(newLimit) && newLimit > 4) {

        /*set the global value of itemsPerPage with the new value */
        itemsPerPage = newLimit;

        /*set the global value of myFilterRecipes with the new value */
        myFilterRecipes = filteredList;

        /*draw the result on the screen */
        renderRecipes(filteredList);
    }
}

/*this is the function excuted when button aplly clicked */
function applyFilter() {
    result = sortRecipes();
    updateRecipesPerPage(filterByType(result));
}

/*this function excuted when the clear button is clicked */
function clearFilter() {
    /*just clear all filter inputs and the globl list of filter */
    document.getElementById("sortDropdown").value = "none";
    document.getElementById("recipeTypeDropdown").value = "all"
    document.getElementById("recipesPerPageInput").value = 5;
    myFilterRecipes = [];
    /*finally check on the selected tab to decide which recipes draw local or global */
    if (selectedTab === 0)
        /*the render function called inside it*/
        fetchPublicRecipes()
    else
        renderRecipes(myRecipes);


}

/*this function called when the search button clicked*/
async function handleSearch() {
    const query = document.getElementById("searchInput").value.trim();
    /*check if a valid query or not */
    if (!query) {
        document.getElementById("searchError").style.display = "block";
        return;
    }
    document.getElementById("searchError").style.display = "none";

    /* check if there was a result from filter to search in or not */
    if (myFilterRecipes.length == 0) {

        /* if the current tab is Public Recipes */
        if (selectedTab === 0) {
            // Public Recipes - Fetch from API
            try {
                const response = await fetch(`https://dummyjson.com/recipes/search?q=${query}`);
                const data = await response.json();
                publicSearch = data.recipes;
                publicSearch = data.recipes;
                renderRecipes(data.recipes);
            } catch (error) {
                console.error("Error fetching search results:", error);
            }
        }
        /*if the current tab is my recipes search in myRecipes list */
        else {
            let searchResult = myRecipes.filter(recipe =>
                recipe.name.toLowerCase().includes(query.toLowerCase())
            );

            /*set myRecipeSearch with the new result */
            myRecipeSearch = searchResult;

            /* draw the result on the screen*/
            renderRecipes(searchResult);

        }
    }
    /*if there was a filter result to search into  */
    else {
        // My Recipes - Search within local list
        const filteredMyRecipes = myFilterRecipes.filter(recipe =>
            recipe.name.toLowerCase().includes(query.toLowerCase())
        );

        /*set myRecipeSearch with the new result */
        myRecipeSearch = filteredMyRecipes;

        /* draw the result on the screen*/
        renderRecipes(filteredMyRecipes);
    }
}




/*used to render tabs */
function renderTabs() {
    /* get the image of the add to be able to hide in public recipes tab */
    const addImage = document.querySelector(".image-add");

    /* get the div that will conatins the tabs */
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';
    /*draw the tabs in tabs list*/
    tabs.forEach((tab, index) => {
        /*create span to contain the tab text */
        const span = document.createElement('span');
        span.textContent = tab;
        /* the selected tab will have a border */
        if (index === selectedTab) {
            span.classList.add('active');
        }

        /* when switch tab clear all filters and tabs and set the selected with the new value */
        span.onclick = () => {

            selectedTab = index;
            currentPage = 1; // Reset page to 1 when switching tabs
            renderTabs();
            clearSearch();
            clearFilter();
            /*check to decide which recipes will appears */
            if (selectedTab === 0) {
                fetchPublicRecipes();

            } else {
                /*show add button in my recipes*/
                addImage.style.visibility = "visible";

                renderRecipes(myRecipes);
            }
        };

        tabsContainer.appendChild(span);
    });
}

/*this function excuted when the clear button clicked */
function clearSearch() {
    /*clear the input text*/
    document.getElementById("searchInput").value = "";
    /*clear the two lists of previous search */
    publicSearch = [];
    myRecipeSearch = [];

    /*check which tab visible now */
    if (selectedTab === 0)
        fetchPublicRecipes()
    else
        renderRecipes(myRecipes);
}

/* this function is responsible for drawing the recipes items */
function renderRecipes(recipeList) {
    /*first access the div that tha recipes items will draw inside */
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';

    /*in case of the recipes list is empty just display a text says there are no recipes */
    if (recipeList.length === 0) {
        recipeGrid.innerHTML = `<div class="no-recipes"><p>No recipes yet.</p></div>`;

        /*handle pagination part */
        document.getElementById('pagination').innerHTML = '';
        /* stop */
        return;
    }

    /*but in case there are an element in the list */
    /*calculate the recipes per page and slice it from list given in the function parameter*/
    /*currentPage initialized with value 1 */
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedRecipes = recipeList.slice(start, start + itemsPerPage);
    /* draw the itemps in this page */
    paginatedRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="recipe-content">
                <h3>${recipe.name}</h3>
                <div class="my-recipe-options">
                    ${selectedTab === 1 ? `<a class="edit" onclick="openEditPopup(${recipe.id})">Edit</a>` : ""}
                    <a class="read-more" onclick="openDetailsPopup(${recipe.id})">Read more</a>
                    ${selectedTab === 1 ? `<a class="delete" onclick="deleteRecipe(${recipe.id})">Delete</a>` : ""}
                </div>
            </div>
        `;

        recipeGrid.appendChild(recipeCard);
    });
    /* drway the pagination part below */
    renderPagination(recipeList);
}


/*this function draw the pagination part*/
function renderPagination(recipeList) {

    /*get the div that will containts the pagination*/
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    /* dividing the number of total recipes on the global value of number per page */
    const totalPages = Math.ceil(recipeList.length / itemsPerPage);

    if (totalPages <= 1) return; // Hide pagination if only one page exists

    /* create the previous button */
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&lt;';

    /* disable the previous button in case the current page is 1 */
    prevButton.disabled = currentPage === 1;

    /*in case this button is clicked decrease the number of current page */
    /* then call changePage function to calculate the recipes that will display and render them*/
    prevButton.onclick = () => changePage(currentPage - 1, recipeList);
    pagination.appendChild(prevButton);

    /* draw pagination buttons */
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.classList.toggle('active', i === currentPage);

        /*in case any button clicked call changePage changePage
         function to calculate the recipes that 
         will display and render them*/
        pageButton.onclick = () => changePage(i, recipeList);

        pagination.appendChild(pageButton);
    }
    /* create next button */
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&gt;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => changePage(currentPage + 1, recipeList);
    pagination.appendChild(nextButton);
}

/*this function excuted when the the page changed */
function changePage(page, recipeList) {
    /*calculate the new recipes that will be drawn on the screen */
    const totalPages = Math.ceil(recipeList.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderRecipes(recipeList);
    }
}
/*this function executed when add button clicked */
function openPopup() {
    const popup = document.getElementById("recipePopup");
    popup.style.display = "flex";
    setTimeout(() => {
        popup.classList.add("show");
    }, 10);
}
/*this function executed when close button clicked in the popup */
function closePopup() {

    const popup = document.getElementById("recipePopup");
    popup.classList.remove("show");
    setTimeout(() => {
        popup.style.display = "none";
    }, 300);

    document.getElementById("recipeTitle").value = "";
    document.getElementById("recipeType").value = "";
    document.getElementById("recipeIngredients").value = "";
    document.getElementById("select-image").value = "";
}

/*this function execute when add recipe button clicked */
function addRecipe() {
    /* get all data from inputs*/
    const title = document.getElementById("recipeTitle").value.trim();
    const type = document.getElementById("recipeType").value.trim();
    const ingredients = document.getElementById("recipeIngredients").value.trim();
    const imageInput = document.getElementById("select-image");
    const errorMessage = document.querySelector(".error-message");

    // Show error message if any field is empty
    if (!title || !type || !ingredients || imageInput.files.length === 0) {
        errorMessage.style.visibility = "visible";
        return;
    }

    // Hide error message if all fields are filled
    errorMessage.style.visibility = "hidden";

    // Convert ingredients string into an array
    const ingredientsArray = ingredients.split(",").map(ing => ing.trim());

    // Read the selected image file
    const reader = new FileReader();
    reader.onload = function (e) {
        const newRecipe = {
            id: myRecipes.length + 1,
            name: title,
            mealType: [type],
            ingredients: ingredientsArray,
            image: e.target.result // Base64 image data
        };

        // Add new recipe to myRecipes list
        myRecipes.push(newRecipe);

        // Re-render the recipes
        renderRecipes(myRecipes);

        // Close the popup after adding the recipe
        closePopup();
    };
    /*Converts it to Base64 format so it can be displayed immediately without needing a server upload.*/
    reader.readAsDataURL(imageInput.files[0]);
}
/* this function excuted when the read more button clicked */
function openDetailsPopup(recipeId) {

    /*check on the tabs to decide which list will used to get this item */
    let recipe = selectedTab === 0
        ? recipes.find(r => r.id === recipeId)
        : myRecipes.find(r => r.id === recipeId);

    if (!recipe) return;

    /*set details of this recipe in the popup component*/
    document.getElementById("popupRecipeName").textContent = recipe.name;
    document.getElementById("popupRecipeImage").src = recipe.image;
    document.getElementById("popupRecipeType").textContent = recipe.mealType[0];

    const ingredientsList = document.getElementById("popupRecipeIngredients");
    ingredientsList.innerHTML = "";
    /*draw the ingredients */
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement("li");
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });
    /* diplay the pop up with details*/
    const popup = document.getElementById("detailsPopup");
    popup.style.display = "flex";
    setTimeout(() => popup.classList.add("show"), 10);
}


/*excuted when close button in the details menu clicked */
function closeDetailsPopup() {
    const popup = document.getElementById("detailsPopup");
    popup.classList.remove("show");

    setTimeout(() => {
        popup.style.display = "none";
    }, 300);
}

let recipeToDelete = null; // Stores the ID of the recipe to be deleted


/*this function excuted when delete button clicked on the item */
function deleteRecipe(recipeId) {
    recipeToDelete = recipeId; // Store the recipe ID temporarily
    // Show popup
    document.getElementById('deletePopup').style.display = 'flex';
    setTimeout(() => document.getElementById('deletePopup').classList.add('show'), 10);
}
/*display when the user confirm to delete the recipe */
function confirmDelete() {
    if (recipeToDelete !== null) {
        myRecipes = myRecipes.filter(recipe => recipe.id !== recipeToDelete);
        renderRecipes(myRecipes); // Re-render recipes
    }
    //close the pop up
    closeDeletePopup();
}
/*called when the no button clicked in the pop up */
function closeDeletePopup() {
    const popup = document.getElementById('deletePopup');
    popup.classList.remove('show');
    setTimeout(() => popup.style.display = 'none', 300);
}

/*this function excuted when the edit button on the item clicked */
function openEditPopup(recipeId) {
    //get this item
    let recipe = myRecipes.find(r => r.id === recipeId);
    if (!recipe) return;
    //set the recipe details into the popup component 
    document.getElementById("editRecipeId").value = recipe.id;
    document.getElementById("editRecipeTitle").value = recipe.name;
    document.getElementById("editRecipeType").value = recipe.mealType[0];
    document.getElementById("editRecipeIngredients").value = recipe.ingredients.join(", ");
    //setup the image preview
    const imagePreview = document.getElementById("editRecipePreview");

    if (recipe.image) {
        imagePreview.src = recipe.image;
        imagePreview.style.display = "block"; // Show image if it exists
    } else {
        imagePreview.src = "";
        imagePreview.style.display = "none"; // Hide if no image
    }


    //get the div of the pop up and display it
    const popup = document.getElementById("editPopup");
    popup.style.display = "flex";
}
//this function excuted when discard button clicked
function closeEditPopup() {
    document.getElementById("editPopup").style.display = "none";

    // Reset image preview when closing
    const imagePreview = document.getElementById("editRecipePreview");
    imagePreview.src = "";
    imagePreview.style.display = "none";

    // Clear file input field to prevent stale images
    document.getElementById("edit-select-image").value = "";
}
/*this function excuted when the update button clicked */
function updateRecipe() {
    //get the data from the popup component
    const recipeId = parseInt(document.getElementById("editRecipeId").value);
    const updatedTitle = document.getElementById("editRecipeTitle").value.trim();
    const updatedType = document.getElementById("editRecipeType").value.trim();
    const updatedIngredients = document.getElementById("editRecipeIngredients").value.trim();
    const imageInput = document.getElementById("edit-select-image");

    if (!updatedTitle || !updatedType || !updatedIngredients) {
        document.getElementById("editErrorMessage").style.display="block";
        return;
    }

    document.getElementById("editErrorMessage").style.display="none";

    //check if the recipe exist or deleted
    let recipeIndex = myRecipes.findIndex(r => r.id === recipeId);
    if (recipeIndex === -1) return;

    //to handle the update of image  
    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            myRecipes[recipeIndex].image = e.target.result;

            // Update the image preview in the popup
            const imagePreview = document.getElementById("editRecipePreview");
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";

            finalizeUpdate(recipeIndex, updatedTitle, updatedType, updatedIngredients);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } 
    //in case the update not contains the image
    else {
        finalizeUpdate(recipeIndex, updatedTitle, updatedType, updatedIngredients);
    }
}

//this function used to updte the recipe inthe list then rerender the recipes
function finalizeUpdate(recipeIndex, updatedTitle, updatedType, updatedIngredients) {
    myRecipes[recipeIndex].name = updatedTitle;
    myRecipes[recipeIndex].mealType = [updatedType];
    myRecipes[recipeIndex].ingredients = updatedIngredients.split(",").map(ing => ing.trim());

    renderRecipes(myRecipes);
    closeEditPopup();
}
//add event listener on the image preview in the edit popup to be visible when changed
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("edit-select-image").addEventListener("change", function (event) {
        const imagePreview = document.getElementById("editRecipePreview");

        if (event.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block"; // Ensure image is visible
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    });
});


















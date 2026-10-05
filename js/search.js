import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ===============================
// GET HTML ELEMENTS
// ===============================

const searchButton =
    document.getElementById("searchButton");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");


// ===============================
// DISPLAY SEARCH RESULT
// ===============================

function displayItem(item, type) {

    const card = document.createElement("div");

    card.style.border = "1px solid black";
    card.style.padding = "15px";
    card.style.margin = "10px";
    card.style.width = "300px";
    card.style.display = "inline-block";
    card.style.verticalAlign = "top";


    // ===========================
    // DATE
    // ===========================

    let dateText = "";

    if (type === "Lost") {
        dateText = item.dateLost || "";
    } else {
        dateText = item.dateFound || "";
    }


    // ===========================
    // PHOTO
    // ===========================

    let photoHTML = "";

    if (item.photo && item.photo.trim() !== "") {

        photoHTML = `
            <img
                src="${item.photo}"
                width="250"
                height="180"
                alt="${item.itemName || "Item"}"
            >
        `;

    } else {

        photoHTML = `
            <div style="
                width:250px;
                height:180px;
                border:1px solid gray;
                display:flex;
                align-items:center;
                justify-content:center;
            ">
                No Photo
            </div>
        `;

    }


    // ===========================
    // CARD
    // ===========================

    card.innerHTML = `

        ${photoHTML}

        <h3>${item.itemName || "Unknown Item"}</h3>

        <p>
            <b>Type:</b>
            ${type}
        </p>

        <p>
            <b>Category:</b>
            ${item.category || "Not available"}
        </p>

        <p>
            <b>Location:</b>
            ${item.location || "Not available"}
        </p>

        <p>
            <b>Date:</b>
            ${dateText || "Not available"}
        </p>

        <p>
            <b>Description:</b>
            ${item.description || "Not available"}
        </p>

        <p>
            <b>Contact:</b>
            ${item.contact || "Not available"}
        </p>

    `;


    searchResults.appendChild(card);
}


// ===============================
// SEARCH FUNCTION
// ===============================

async function searchItems() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    // Clear previous results
    searchResults.innerHTML = "";


    // ===========================
    // EMPTY SEARCH
    // ===========================

    if (searchText === "") {

        searchResults.innerHTML =
            "<p>Please enter something to search.</p>";

        return;
    }


    // Prevent multiple clicks
    searchButton.disabled = true;
    searchButton.innerText = "Searching...";


    // This tells us whether at least
    // one matching item was found
    let foundMatch = false;


    try {

        // =================================
        // GET LOST ITEMS
        // =================================

        const lostSnapshot =
            await getDocs(
                collection(db, "lostItems")
            );


        // =================================
        // SEARCH LOST ITEMS
        // =================================

        lostSnapshot.forEach(function(doc) {

            const item = doc.data();


            const itemName =
                String(item.itemName || "")
                    .toLowerCase();

            const category =
                String(item.category || "")
                    .toLowerCase();

            const location =
                String(item.location || "")
                    .toLowerCase();

            const description =
                String(item.description || "")
                    .toLowerCase();


            if (
                itemName.includes(searchText) ||
                category.includes(searchText) ||
                location.includes(searchText) ||
                description.includes(searchText)
            ) {

                foundMatch = true;

                displayItem(item, "Lost");

            }

        });


        // =================================
        // GET FOUND ITEMS
        // =================================

        const foundSnapshot =
            await getDocs(
                collection(db, "foundItems")
            );


        // =================================
        // SEARCH FOUND ITEMS
        // =================================

        foundSnapshot.forEach(function(doc) {

            const item = doc.data();


            const itemName =
                String(item.itemName || "")
                    .toLowerCase();

            const category =
                String(item.category || "")
                    .toLowerCase();

            const location =
                String(item.location || "")
                    .toLowerCase();

            const description =
                String(item.description || "")
                    .toLowerCase();


            if (
                itemName.includes(searchText) ||
                category.includes(searchText) ||
                location.includes(searchText) ||
                description.includes(searchText)
            ) {

                foundMatch = true;

                displayItem(item, "Found");

            }

        });


        // =================================
        // NO RESULT
        // =================================

        if (!foundMatch) {

            searchResults.innerHTML =
                "<p>No matching items found.</p>";

        }

    }


    catch (error) {

        console.error(
            "Search error:",
            error
        );


        searchResults.innerHTML =
            "<p>Error while searching. Please try again.</p>";

    }


    finally {

        // Enable button again
        searchButton.disabled = false;
        searchButton.innerText = "Search";

    }

}


// ===============================
// SEARCH BUTTON
// ===============================

searchButton.addEventListener(
    "click",
    searchItems
);


// ===============================
// PRESS ENTER TO SEARCH
// ===============================

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            searchItems();

        }

    }
);
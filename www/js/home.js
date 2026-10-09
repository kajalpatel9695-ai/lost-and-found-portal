import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// =====================================
// GET HTML ELEMENTS
// =====================================

const homeLostItems = document.getElementById("homeLostItems");
const homeFoundItems = document.getElementById("homeFoundItems");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// =====================================
// CREATE REPORT CARD
// =====================================

function createHomeItemCard(item, type) {
    const card = document.createElement("div");
    card.className = "item-card";

    // Photo
    if (item.photo && item.photo.trim() !== "") {
        const photo = document.createElement("img");

        photo.src = item.photo;
        photo.width = 250;
        photo.height = 180;
        photo.alt = type + " Item";
        photo.style.objectFit = "contain";
        photo.style.display = "block";
        photo.style.marginBottom = "15px";
        photo.style.borderRadius = "8px";

        card.appendChild(photo);
    } else {
        const noPhoto = document.createElement("div");

        noPhoto.textContent = "No Photo";
        noPhoto.style.width = "250px";
        noPhoto.style.height = "180px";
        noPhoto.style.border = "1px solid #ccc";
        noPhoto.style.display = "flex";
        noPhoto.style.alignItems = "center";
        noPhoto.style.justifyContent = "center";
        noPhoto.style.marginBottom = "15px";
        noPhoto.style.borderRadius = "8px";

        card.appendChild(noPhoto);
    }

    // Card heading
    const heading = document.createElement("h3");
    heading.textContent = item.itemName || "Unknown Item";
    card.appendChild(heading);

    // Report details
    const details = [
        ["Person Name", item.personName || "Not available"],
        ["Item Name", item.itemName || "Not available"],
        ["Category", item.category || "Not available"],
        [
            type === "Lost" ? "Location Lost" : "Location Found",
            item.location || "Not available"
        ],
        [
            type === "Lost" ? "Date Lost" : "Date Found",
            (type === "Lost" ? item.dateLost : item.dateFound)
                || "Not available"
        ],
        ["Description", item.description || "Not available"],
        ["Contact", item.contact || "Not available"]
    ];

    details.forEach(function ([label, value]) {
        const paragraph = document.createElement("p");
        const bold = document.createElement("b");

        bold.textContent = label + ": ";
        paragraph.appendChild(bold);
        paragraph.appendChild(document.createTextNode(value));

        card.appendChild(paragraph);
    });

    return card;
}

// =====================================
// DISPLAY LOST ITEMS
// =====================================

function displayHomeLostItems(items) {
    homeLostItems.innerHTML = "";

    if (items.length === 0) {
        homeLostItems.innerHTML =
            "<p>No lost items reported yet.</p>";
        return;
    }

    items.forEach(function (item) {
        const card = createHomeItemCard(item, "Lost");
        homeLostItems.appendChild(card);
    });
}

// =====================================
// DISPLAY FOUND ITEMS
// =====================================

function displayHomeFoundItems(items) {
    homeFoundItems.innerHTML = "";

    if (items.length === 0) {
        homeFoundItems.innerHTML =
            "<p>No found items reported yet.</p>";
        return;
    }

    items.forEach(function (item) {
        const card = createHomeItemCard(item, "Found");
        homeFoundItems.appendChild(card);
    });
}

// =====================================
// LOAD LOST ITEMS
// =====================================

async function loadLostItems() {
    try {
        const snapshot = await getDocs(
            collection(db, "lostItems")
        );

        const items = [];

        snapshot.forEach(function (docSnap) {
            items.push(docSnap.data());
        });

        displayHomeLostItems(items);

    } catch (error) {
        console.error("Error loading lost items:", error);

        homeLostItems.innerHTML =
            "<p>Error loading lost items.</p>";
    }
}

// =====================================
// LOAD FOUND ITEMS
// =====================================

async function loadFoundItems() {
    try {
        const snapshot = await getDocs(
            collection(db, "foundItems")
        );

        const items = [];

        snapshot.forEach(function (docSnap) {
            items.push(docSnap.data());
        });

        displayHomeFoundItems(items);

    } catch (error) {
        console.error("Error loading found items:", error);

        homeFoundItems.innerHTML =
            "<p>Error loading found items.</p>";
    }
}

// =====================================
// SEARCH
// =====================================

async function searchItems() {
    const searchText = searchInput.value.toLowerCase().trim();

    if (searchText === "") {
        await Promise.all([
            loadLostItems(),
            loadFoundItems()
        ]);
        return;
    }

    try {
        const [lostSnapshot, foundSnapshot] = await Promise.all([
            getDocs(collection(db, "lostItems")),
            getDocs(collection(db, "foundItems"))
        ]);

        const lostItems = [];
        const foundItems = [];

        lostSnapshot.forEach(function (docSnap) {
            lostItems.push(docSnap.data());
        });

        foundSnapshot.forEach(function (docSnap) {
            foundItems.push(docSnap.data());
        });

        function matchesSearch(item) {
            return [
                item.personName,
                item.itemName,
                item.category,
                item.location,
                item.description,
                item.contact
            ].some(function (value) {
                return String(value || "")
                    .toLowerCase()
                    .includes(searchText);
            });
        }

        displayHomeLostItems(
            lostItems.filter(matchesSearch)
        );

        displayHomeFoundItems(
            foundItems.filter(matchesSearch)
        );

    } catch (error) {
        console.error("Search error:", error);
        alert("Unable to search items. Please try again.");
    }
}

// =====================================
// SEARCH BUTTON
// =====================================

if (searchButton) {
    searchButton.addEventListener("click", searchItems);
}

// =====================================
// ENTER KEY
// =====================================

if (searchInput) {
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchItems();
        }
    });
}

// =====================================
// INITIAL LOAD
// =====================================

loadLostItems();
loadFoundItems();

console.log("HOME JS LOADED");
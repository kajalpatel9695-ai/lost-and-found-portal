import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// =====================================
// GET HTML ELEMENTS
// =====================================

const homeLostItems =
    document.getElementById("homeLostItems");

const homeFoundItems =
    document.getElementById("homeFoundItems");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");


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

        const card =
            document.createElement("div");

        card.className = "item-card";


        let photoHTML = "";

        if (item.photo && item.photo.trim() !== "") {

            photoHTML = `
                <img
                    src="${item.photo}"
                    width="250"
                    height="180"
                    alt="Lost Item"
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
                    margin:auto;
                ">
                    No Photo
                </div>
            `;
        }


        card.innerHTML = `

            ${photoHTML}

            <h3>
                ${item.itemName || "Unknown Item"}
            </h3>

            <p>
                <b>Type:</b> Lost
            </p>

            <p>
                <b>Category:</b>
                ${item.category || "Not available"}
            </p>

            <p>
                <b>Lost Location:</b>
                ${item.location || "Not available"}
            </p>

            <p>
                <b>Date Lost:</b>
                ${item.dateLost || "Not available"}
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

        const card =
            document.createElement("div");

        card.className = "item-card";


        let photoHTML = "";

        if (item.photo && item.photo.trim() !== "") {

            photoHTML = `
                <img
                    src="${item.photo}"
                    width="250"
                    height="180"
                    alt="Found Item"
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
                    margin:auto;
                ">
                    No Photo
                </div>
            `;
        }


        card.innerHTML = `

            ${photoHTML}

            <h3>
                ${item.itemName || "Unknown Item"}
            </h3>

            <p>
                <b>Type:</b> Found
            </p>

            <p>
                <b>Category:</b>
                ${item.category || "Not available"}
            </p>

            <p>
                <b>Found Location:</b>
                ${item.location || "Not available"}
            </p>

            <p>
                <b>Date Found:</b>
                ${item.dateFound || "Not available"}
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


        homeFoundItems.appendChild(card);

    });

}


// =====================================
// LOAD ALL LOST ITEMS
// =====================================

async function loadLostItems() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "lostItems")
            );

        const items = [];

        snapshot.forEach(function (doc) {

            items.push(doc.data());

        });


        displayHomeLostItems(items);

    }

    catch (error) {

        console.error(
            "Error loading lost items:",
            error
        );

        homeLostItems.innerHTML =
            "<p>Error loading lost items.</p>";

    }

}


// =====================================
// LOAD ALL FOUND ITEMS
// =====================================

async function loadFoundItems() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "foundItems")
            );

        const items = [];

        snapshot.forEach(function (doc) {

            items.push(doc.data());

        });


        displayHomeFoundItems(items);

    }

    catch (error) {

        console.error(
            "Error loading found items:",
            error
        );

        homeFoundItems.innerHTML =
            "<p>Error loading found items.</p>";

    }

}


// =====================================
// SEARCH
// =====================================

async function searchItems() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    if (searchText === "") {

        loadLostItems();
        loadFoundItems();

        return;
    }


    try {

        // Get Lost Items

        const lostSnapshot =
            await getDocs(
                collection(db, "lostItems")
            );

        const lostItems = [];

        lostSnapshot.forEach(function (doc) {

            lostItems.push(doc.data());

        });


        // Get Found Items

        const foundSnapshot =
            await getDocs(
                collection(db, "foundItems")
            );

        const foundItems = [];

        foundSnapshot.forEach(function (doc) {

            foundItems.push(doc.data());

        });


        // Search Lost

        const searchedLostItems =
            lostItems.filter(function (item) {

                return (

                    String(item.itemName || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    String(item.category || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    String(item.location || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    String(item.description || "")
                        .toLowerCase()
                        .includes(searchText)

                );

            });


        // Search Found

        const searchedFoundItems =
            foundItems.filter(function (item) {

                return (

                    String(item.itemName || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    String(item.category || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    String(item.location || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    String(item.description || "")
                        .toLowerCase()
                        .includes(searchText)

                );

            });


        displayHomeLostItems(
            searchedLostItems
        );

        displayHomeFoundItems(
            searchedFoundItems
        );

    }

    catch (error) {

        console.error(
            "Search error:",
            error
        );

    }

}


// =====================================
// BUTTON
// =====================================

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchItems
    );

}


// =====================================
// ENTER KEY
// =====================================

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchItems();

            }

        }
    );

}


// =====================================
// INITIAL LOAD
// =====================================

loadLostItems();
loadFoundItems();

console.log("HOME JS LOADED");
console.log("Lost and Found loading started");
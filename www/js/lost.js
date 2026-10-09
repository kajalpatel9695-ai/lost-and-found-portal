import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ===============================
// GET FORM ELEMENTS
// ===============================

const lostItemForm = document.getElementById("lostItemForm");
const itemPhoto = document.getElementById("itemPhoto");
const photoPreview = document.getElementById("photoPreview");


// ===============================
// PHOTO PREVIEW
// ===============================

itemPhoto.addEventListener("change", function () {

    const file = itemPhoto.files[0];

    if (!file) {
        photoPreview.src = "";
        photoPreview.style.display = "none";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        photoPreview.src = event.target.result;
        photoPreview.style.display = "block";
    };

    reader.readAsDataURL(file);
});


// ===============================
// COMPRESS IMAGE
// ===============================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                const canvas = document.createElement("canvas");

                const maxWidth = 600;
                const maxHeight = 600;

                let width = img.width;
                let height = img.height;

                if (width > height) {

                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }

                } else {

                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                const compressedImage =
                    canvas.toDataURL("image/jpeg", 0.6);

                resolve(compressedImage);
            };

            img.onerror = function () {
                reject(new Error("Image load failed."));
            };

            img.src = event.target.result;
        };

        reader.onerror = function () {
            reject(new Error("File read failed."));
        };

        reader.readAsDataURL(file);
    });
}


// ===============================
// SUBMIT LOST ITEM FORM
// ===============================

lostItemForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // Get Person Name
    const personName =
        document.getElementById("personName").value.trim();

    // Get Item Name
    const itemName =
        document.getElementById("itemName").value.trim();

    // Get Category
    const category =
        document.getElementById("category").value;

    // Get remaining details
    const location =
        document.getElementById("location").value.trim();

    const dateLost =
        document.getElementById("dateLost").value;

    const description =
        document.getElementById("description").value.trim();

    const contact =
        document.getElementById("contact").value.trim();

    let photo = "";

    try {

        // Compress selected photo
        if (itemPhoto.files[0]) {
            photo = await compressImage(itemPhoto.files[0]);
        }

        // Create report
        const lostItem = {

            userId: user.uid,

            personName: personName,

            itemName: itemName,

            category: category,

            location: location,

            dateLost: dateLost,

            description: description,

            contact: contact,

            photo: photo
        };

        // Save report to Firebase
        await addDoc(
            collection(db, "lostItems"),
            lostItem
        );

        alert("Lost item reported successfully!");

        // Reset form
        lostItemForm.reset();

        // Hide photo preview
        photoPreview.src = "";
        photoPreview.style.display = "none";

    } catch (error) {

        console.error("Error adding lost item:", error);

        alert("Error! Lost item save nahi hua. Please try again.");
    }
});
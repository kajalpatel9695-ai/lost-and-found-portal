import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// Get form
const lostItemForm = document.getElementById("lostItemForm");

// Get photo input
const itemPhoto = document.getElementById("itemPhoto");

// Get photo preview
const photoPreview = document.getElementById("photoPreview");


// Photo Preview
itemPhoto.addEventListener("change", function () {

    const file = itemPhoto.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (event) {

            photoPreview.src = event.target.result;

            photoPreview.style.display = "block";

        };

        reader.readAsDataURL(file);
    }
});


// Compress Photo
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


                // Resize image
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

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );


                // Convert to small JPEG
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


// Submit Form
lostItemForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Check login
    const user = auth.currentUser;

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    // Get values
    const itemName =
        document.getElementById("itemName").value;

    const category =
        document.getElementById("category").value;

    const location =
        document.getElementById("location").value;

    const dateLost =
        document.getElementById("dateLost").value;

    const description =
        document.getElementById("description").value;

    const contact =
        document.getElementById("contact").value;


    // Photo
    let photo = "";

    try {

        if (itemPhoto.files[0]) {

            photo = await compressImage(
                itemPhoto.files[0]
            );
        }


        // Create item object
        const lostItem = {

            userId: user.uid,

            itemName: itemName,

            category: category,

            location: location,

            dateLost: dateLost,

            description: description,

            contact: contact,

            photo: photo
        };


        // Save to Firebase
        await addDoc(
            collection(db, "lostItems"),
            lostItem
        );


        // Success notification
        alert("Lost item reported successfully!");


        // Clear form
        lostItemForm.reset();


        // Hide photo
        photoPreview.style.display = "none";

        photoPreview.src = "";

    }

    catch (error) {

        console.error(
            "Error adding lost item:",
            error
        );

        alert(
            "Error! Lost item save nahi hua."
        );
    }

});
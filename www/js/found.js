import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ===============================
// GET FORM ELEMENTS
// ===============================

const foundItemForm =
    document.getElementById("foundItemForm");

const itemPhoto =
    document.getElementById("itemPhoto");

const photoPreview =
    document.getElementById("photoPreview");


// ===============================
// COMPRESS IMAGE
// ===============================

function compressImage(file) {

    return new Promise(function(resolve, reject) {

        const reader = new FileReader();

        reader.onload = function(event) {

            const img = new Image();

            img.onload = function() {

                const canvas =
                    document.createElement("canvas");

                const maxWidth = 800;
                const maxHeight = 800;

                let width = img.width;
                let height = img.height;


                // Resize image
                if (width > maxWidth) {

                    height =
                        height * (maxWidth / width);

                    width = maxWidth;

                }


                if (height > maxHeight) {

                    width =
                        width * (maxHeight / height);

                    height = maxHeight;

                }


                canvas.width = width;
                canvas.height = height;


                const ctx =
                    canvas.getContext("2d");


                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );


                // Convert to compressed JPEG
                const compressedImage =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.6
                    );


                resolve(compressedImage);

            };


            img.onerror = function() {

                reject(
                    new Error("Image load failed")
                );

            };


            img.src = event.target.result;

        };


        reader.onerror = function() {

            reject(
                new Error("File reading failed")
            );

        };


        reader.readAsDataURL(file);

    });

}


// ===============================
// PHOTO PREVIEW
// ===============================

itemPhoto.addEventListener(
    "change",
    function() {

        const file =
            itemPhoto.files[0];

        if (!file) {

            photoPreview.style.display =
                "none";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                photoPreview.src =
                    event.target.result;

                photoPreview.style.display =
                    "block";

            };


        reader.readAsDataURL(file);

    }
);


// ===============================
// SUBMIT FORM
// ===============================

foundItemForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // ===========================
        // CHECK LOGIN
        // ===========================

        const user =
            auth.currentUser;


        if (!user) {

            alert("Please login first.");

            window.location.href =
                "login.html";

            return;

        }


        // ===========================
        // GET FORM VALUES
        // ===========================

        const itemName =
            document
                .getElementById("itemName")
                .value
                .trim();


        const category =
            document
                .getElementById("category")
                .value
                .trim();


        const location =
            document
                .getElementById("location")
                .value
                .trim();


        const dateFound =
            document
                .getElementById("dateFound")
                .value;


        const description =
            document
                .getElementById("description")
                .value
                .trim();


        const contact =
            document
                .getElementById("contact")
                .value
                .trim();


        // ===========================
        // PHOTO
        // ===========================

        let photo = "";


        try {

            if (itemPhoto.files[0]) {

                photo =
                    await compressImage(
                        itemPhoto.files[0]
                    );

            }

        }

        catch (error) {

            console.error(
                "Photo compression error:",
                error
            );

            alert(
                "Photo process nahi ho paayi."
            );

            return;

        }


        // ===========================
        // CREATE FOUND ITEM
        // ===========================

        const foundItem = {

            userId: user.uid,

            itemName: itemName,

            category: category,

            location: location,

            dateFound: dateFound,

            description: description,

            contact: contact,

            photo: photo

        };


        // ===========================
        // SAVE TO FIRESTORE
        // ===========================

        try {

            await addDoc(
                collection(
                    db,
                    "foundItems"
                ),
                foundItem
            );


            alert(
                "Found item reported successfully!"
            );


            // Clear form
            foundItemForm.reset();


            // Hide photo preview
            photoPreview.src = "";

            photoPreview.style.display =
                "none";


            console.log(
                "Found item saved successfully!"
            );

        }

        catch (error) {

            console.error(
                "Error adding found item:",
                error
            );


            alert(
                "Error! Found item save nahi hua."
            );

        }

    }
);
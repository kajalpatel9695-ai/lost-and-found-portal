import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// ===============================
// REPORTS CONTAINER
// ===============================

const myReports =
    document.getElementById("myReports");


// ===============================
// LOAD MY REPORTS
// ===============================

async function loadMyReports(user) {

    try {

        // Get Lost Items
        const lostSnapshot =
            await getDocs(
                collection(db, "lostItems")
            );


        // Get Found Items
        const foundSnapshot =
            await getDocs(
                collection(db, "foundItems")
            );


        let reports = [];


        // ===============================
        // LOST ITEMS
        // ===============================

        lostSnapshot.forEach(function (docSnap) {

            const data = docSnap.data();

            if (data.userId === user.uid) {

                reports.push({

                    id: docSnap.id,

                    type: "Lost",

                    itemName: data.itemName,

                    category: data.category,

                    location: data.location,

                    date: data.dateLost,

                    description: data.description,

                    contact: data.contact,

                    photo: data.photo

                });

            }

        });


        // ===============================
        // FOUND ITEMS
        // ===============================

        foundSnapshot.forEach(function (docSnap) {

            const data = docSnap.data();

            if (data.userId === user.uid) {

                reports.push({

                    id: docSnap.id,

                    type: "Found",

                    itemName: data.itemName,

                    category: data.category,

                    location: data.location,

                    date: data.dateFound,

                    description: data.description,

                    contact: data.contact,

                    photo: data.photo

                });

            }

        });


        // ===============================
        // NO REPORTS
        // ===============================

        if (reports.length === 0) {

            myReports.innerHTML = `
                <h3>No Reports Found</h3>

                <p>
                    You have not reported any
                    lost or found item yet.
                </p>
            `;

            return;
        }


        // Clear old reports
        myReports.innerHTML = "";


        // ===============================
        // DISPLAY REPORTS
        // ===============================

        reports.forEach(function (report) {

            const reportBox =
                document.createElement("div");


            reportBox.className =
                "item-card";


            // ===============================
            // PHOTO
            // ===============================

            let photoHTML = "";


            if (
                report.photo &&
                report.photo.trim() !== ""
            ) {

                photoHTML = `
                    <img
                        src="${report.photo}"
                        width="150"
                        alt="Item Photo"
                    >
                    <br><br>
                `;

            }


            // ===============================
            // REPORT DETAILS
            // ===============================

            reportBox.innerHTML = `

                <h3>
                    ${report.type} Item
                </h3>

                ${photoHTML}

                <p>
                    <b>Item Name:</b>
                    ${report.itemName || "Not available"}
                </p>

                <p>
                    <b>Category:</b>
                    ${report.category || "Not available"}
                </p>

                <p>
                    <b>Location:</b>
                    ${report.location || "Not available"}
                </p>

                <p>
                    <b>Date:</b>
                    ${report.date || "Not available"}
                </p>

                <p>
                    <b>Description:</b>
                    ${report.description || "Not available"}
                </p>

                <p>
                    <b>Contact:</b>
                    ${report.contact || "Not available"}
                </p>

                <br>

                <button
                    class="delete-report-btn"
                    data-id="${report.id}"
                    data-type="${report.type}"
                >
                    🗑️ Delete Report
                </button>

            `;


            myReports.appendChild(reportBox);

        });


        // ===============================
        // DELETE BUTTONS
        // ===============================

        const deleteButtons =
            document.querySelectorAll(
                ".delete-report-btn"
            );


        deleteButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                async function () {

                    // Prevent double click
                    if (button.disabled) {
                        return;
                    }


                    const reportId =
                        button.dataset.id;

                    const reportType =
                        button.dataset.type;


                    // ===============================
                    // CONFIRMATION
                    // ===============================

                    const confirmDelete =
                        confirm(
                            "Are you sure you want to delete this report?"
                        );


                    if (!confirmDelete) {
                        return;
                    }


                    try {

                        // Disable button
                        button.disabled = true;

                        button.innerText =
                            "Deleting...";


                        // ===============================
                        // COLLECTION NAME
                        // ===============================

                        let collectionName;


                        if (reportType === "Lost") {

                            collectionName =
                                "lostItems";

                        } else if (reportType === "Found") {

                            collectionName =
                                "foundItems";

                        } else {

                            throw new Error(
                                "Invalid report type."
                            );

                        }


                        // ===============================
                        // DELETE FROM FIRESTORE
                        // ===============================

                        const reportRef =
                            doc(
                                db,
                                collectionName,
                                reportId
                            );


                        await deleteDoc(reportRef);


                        // ===============================
                        // REMOVE CARD IMMEDIATELY
                        // ===============================

                        const reportCard =
                            button.closest(".item-card");


                        if (reportCard) {

                            reportCard.remove();

                        }


                        // ===============================
                        // SUCCESS MESSAGE
                        // ===============================

                        alert(
                            `${reportType} report deleted successfully!`
                        );


                        // ===============================
                        // CHECK IF NO REPORTS LEFT
                        // ===============================

                        if (
                            myReports.children.length === 0
                        ) {

                            myReports.innerHTML = `

                                <h3>No Reports Found</h3>

                                <p>
                                    You have not reported any
                                    lost or found item yet.
                                </p>

                            `;

                        }


                    }

                    catch (error) {

                        console.error(
                            "Delete error:",
                            error
                        );


                        // Enable button again
                        button.disabled = false;

                        button.innerText =
                            "🗑️ Delete Report";


                        alert(
                            "Report delete nahi ho paayi. Please try again."
                        );

                    }

                }
            );

        });

    }

    catch (error) {

        console.error(
            "Error loading reports:",
            error
        );


        myReports.innerHTML = `

            <p>
                Error loading your reports.
            </p>

        `;

    }

}


// ===============================
// CHECK LOGIN
// ===============================

onAuthStateChanged(
    auth,
    function (user) {

        if (!user) {

            alert(
                "Please login first."
            );

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Current user:",
            user.email
        );


        loadMyReports(user);

    }
);


// ===============================
// LOGOUT
// ===============================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            try {

                await signOut(auth);


                alert(
                    "Logged out successfully!"
                );


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Logout failed!"
                );

            }

        }
    );

}
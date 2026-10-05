import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ===============================
// GET ELEMENTS
// ===============================

const userName =
    document.getElementById("userName");

const userCollegeId =
    document.getElementById("userCollegeId");

const userEmail =
    document.getElementById("userEmail");

const userPhone =
    document.getElementById("userPhone");

const userStatus =
    document.getElementById("accountStatus");

const userId =
    document.getElementById("userId");

const accountCreated =
    document.getElementById("accountCreated");

const logoutBtn =
    document.getElementById("logoutBtn");

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");

const profileForm =
    document.getElementById("profileForm");


// ===============================
// CHECK LOGIN
// ===============================

onAuthStateChanged(auth, async function (user) {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    try {

        const userRef =
            doc(db, "users", user.uid);

        const userDoc =
            await getDoc(userRef);


        if (userDoc.exists()) {

            const data =
                userDoc.data();


            userName.textContent =
                data.name || "Not available";

            userCollegeId.textContent =
                data.collegeId || "Not available";

            userEmail.textContent =
                data.email || user.email;

            userPhone.textContent =
                data.phone || "Not available";


            // Put existing data inside form

            if (document.getElementById("profileName")) {

                document.getElementById("profileName").value =
                    data.name || "";

            }

            if (document.getElementById("profileCollegeId")) {

                document.getElementById("profileCollegeId").value =
                    data.collegeId || "";

            }

            if (document.getElementById("profilePhone")) {

                document.getElementById("profilePhone").value =
                    data.phone || "";

            }

        }

        else {

            userName.textContent =
                "Not available";

            userCollegeId.textContent =
                "Not available";

            userEmail.textContent =
                user.email;

            userPhone.textContent =
                "Not available";

        }


        // Firebase Authentication details

        userStatus.textContent =
            "Logged in";

        userId.textContent =
            user.uid;


        if (user.metadata.creationTime) {

            accountCreated.textContent =
                new Date(
                    user.metadata.creationTime
                ).toLocaleDateString();

        }

        else {

            accountCreated.textContent =
                "Not available";

        }

    }

    catch (error) {

        console.error(
            "Error loading account:",
            error
        );

        alert(
            "Unable to load account details."
        );

    }

});


// ===============================
// SAVE / UPDATE PROFILE
// ===============================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;

            }


            const name =
                document.getElementById(
                    "profileName"
                ).value.trim();

            const collegeId =
                document.getElementById(
                    "profileCollegeId"
                ).value.trim();

            const phone =
                document.getElementById(
                    "profilePhone"
                ).value.trim();


            if (
                name === "" ||
                collegeId === "" ||
                phone === ""
            ) {

                alert(
                    "Please fill all profile details."
                );

                return;

            }


            try {

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        name: name,

                        collegeId: collegeId,

                        email: user.email,

                        phone: phone,

                        userId: user.uid

                    },
                    {
                        merge: true
                    }
                );


                alert(
                    "Profile saved successfully!"
                );


                // Update displayed details

                userName.textContent =
                    name;

                userCollegeId.textContent =
                    collegeId;

                userEmail.textContent =
                    user.email;

                userPhone.textContent =
                    phone;

            }

            catch (error) {

                console.error(
                    "Profile save error:",
                    error
                );

                alert(
                    "Profile save nahi hua."
                );

            }

        }
    );

}


// ===============================
// LOGOUT
// ===============================

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

// ===============================
// DELETE ACCOUNT
// ===============================

if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener(
        "click",
        async function () {

            const user = auth.currentUser;

            if (!user) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }


            // Confirm account deletion

            const confirmDelete = confirm(
                "Are you sure you want to permanently delete your account and all your Lost & Found reports?"
            );

            if (!confirmDelete) {
                return;
            }


            // Ask for password

            const password = prompt(
                "For security, please enter your account password:"
            );

            if (password === null) {
                return;
            }

            if (password.trim() === "") {

                alert(
                    "Password cannot be empty."
                );

                return;
            }


            try {

                deleteAccountBtn.disabled = true;

                deleteAccountBtn.textContent =
                    "Deleting...";


                // =================================
                // STEP 1: RE-AUTHENTICATE USER
                // =================================

                const credential =
                    EmailAuthProvider.credential(
                        user.email,
                        password
                    );

                await reauthenticateWithCredential(
                    user,
                    credential
                );


                // =================================
                // STEP 2: DELETE LOST REPORTS
                // =================================

                const lostSnapshot =
                    await getDocs(
                        collection(
                            db,
                            "lostItems"
                        )
                    );


                for (
                    const report
                    of lostSnapshot.docs
                ) {

                    if (
                        report.data().userId ===
                        user.uid
                    ) {

                        await deleteDoc(
                            doc(
                                db,
                                "lostItems",
                                report.id
                            )
                        );

                    }

                }


                // =================================
                // STEP 3: DELETE FOUND REPORTS
                // =================================

                const foundSnapshot =
                    await getDocs(
                        collection(
                            db,
                            "foundItems"
                        )
                    );


                for (
                    const report
                    of foundSnapshot.docs
                ) {

                    if (
                        report.data().userId ===
                        user.uid
                    ) {

                        await deleteDoc(
                            doc(
                                db,
                                "foundItems",
                                report.id
                            )
                        );

                    }

                }


                // =================================
                // STEP 4: DELETE USER PROFILE
                // =================================

                await deleteDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


                // =================================
                // STEP 5: DELETE AUTH ACCOUNT
                // =================================

                await deleteUser(user);


                // =================================
                // SUCCESS
                // =================================

                alert(
                    "Your account and all associated data have been deleted successfully."
                );

                window.location.href =
                    "login.html";

            }


            catch (error) {

                console.error(
                    "Account deletion error:",
                    error
                );


                deleteAccountBtn.disabled =
                    false;

                deleteAccountBtn.textContent =
                    "Delete Account";


                if (
                    error.code ===
                    "auth/wrong-password" ||
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    alert(
                        "Incorrect password. Account was not deleted."
                    );

                }

                else {

                    alert(
                        "Account delete nahi hua. Please try again."
                    );

                }

            }

        }
    );

}
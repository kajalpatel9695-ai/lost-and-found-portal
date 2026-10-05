import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


// ==================================================
// LOGIN
// ==================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            alert("Login successful! Welcome " + user.email);

            window.location.href = "index.html";

        }

        catch (error) {

            console.error("Login error:", error);

            if (error.code === "auth/invalid-credential") {

                alert("Wrong email or password!");

            }
            else if (error.code === "auth/user-not-found") {

                alert("User not found. Please register first.");

            }
            else if (error.code === "auth/wrong-password") {

                alert("Wrong password!");

            }
            else if (error.code === "auth/invalid-email") {

                alert("Please enter a valid email!");

            }
            else {

                alert("Login failed: " + error.message);

            }

        }

    });

}


// ==================================================
// REGISTRATION
// ==================================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // Get registration details

            const name =
                document.getElementById("name").value.trim();

            const collegeId =
                document.getElementById("collegeId").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;


            // Check password

            if (password !== confirmPassword) {

                alert("Password and Confirm Password do not match!");

                return;

            }


            // Password length

            if (password.length < 6) {

                alert("Password should be at least 6 characters!");

                return;

            }


            try {

                // Create Firebase Authentication user

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                // Save user details in Firestore

                await setDoc(
                    doc(db, "users", user.uid),
                    {

                        name: name,

                        collegeId: collegeId,

                        email: email,

                        phone: phone,

                        userId: user.uid,

                        createdAt: new Date().toISOString()

                    }
                );


                alert(
                    "Registration successful! Your information has been saved."
                );


                // Go to login page

                window.location.href =
                    "login.html";

            }


            catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    alert(
                        "This email is already registered!"
                    );

                }

                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    alert(
                        "Password should be at least 6 characters!"
                    );

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    alert(
                        "Please enter a valid email!"
                    );

                }

                else {

                    alert(
                        "Registration failed: " +
                        error.message
                    );

                }

            }

        }
    );

}


// ==================================================
// LOGIN STATUS
// ==================================================

const loginLink =
    document.getElementById("loginLink");

const userDropdown =
    document.getElementById("userDropdown");

const userEmailElement =
    document.getElementById("userEmail");

const logoutBtn =
    document.getElementById("logoutBtn");


onAuthStateChanged(
    auth,
    function (user) {

        if (user) {

            console.log(
                "Logged in user:",
                user.email
            );


            // If login link exists

            if (loginLink) {

                loginLink.textContent =
                    user.email;

                loginLink.href = "#";


                loginLink.onclick =
                    function (event) {

                        event.preventDefault();

                        if (userDropdown) {

                            if (
                                userDropdown.style.display ===
                                "block"
                            ) {

                                userDropdown.style.display =
                                    "none";

                            }

                            else {

                                userDropdown.style.display =
                                    "block";

                            }

                        }

                    };

            }


            // Show email in dropdown

            if (userEmailElement) {

                userEmailElement.textContent =
                    user.email;

            }


            // Logout

            if (logoutBtn) {

                logoutBtn.onclick =
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

                    };

            }

        }


        else {

            console.log(
                "No user is logged in."
            );


            if (loginLink) {

                loginLink.textContent =
                    "Login";

                loginLink.href =
                    "login.html";

            }


            if (userDropdown) {

                userDropdown.style.display =
                    "none";

            }

        }

    }
);
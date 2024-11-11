// Firebase configuration with only the databaseURL
const firebaseConfig = {
    databaseURL: "https://idmachine-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Toggle between forms
function toggleForm(formId) {
    document.getElementById("signInForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById(formId).style.display = "block";
}

// Sign up user (manual authentication using the database)
function signUpUser() {
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    // Check that all fields are filled
    if (!username || !email || !password) {
        alert("Please fill in all fields to sign up.");
        return;
    }

    // Use push() to create a unique key for each user
    const newUserRef = database.ref("users").push();
    newUserRef.set({
        username: username,
        email: email,
        password: password
    }).then(() => {
        alert("Account created successfully. Please log in.");
        toggleForm('signInForm');
    }).catch((error) => {
        alert("Error: " + error.message);
    });
}

// Log in user (manual authentication)
function loginUser() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // Check for matching username and password in the database
    database.ref("users").orderByChild("username").equalTo(username).once("value", snapshot => {
        if (snapshot.exists()) {
            const userData = Object.values(snapshot.val())[0];
            if (userData.password === password) {
                // Simulated login success - redirect to ID page
                window.location.href = "id.html";
            } else {
                alert("Incorrect password.");
            }
        } else {
            alert("No account found with this username.");
        }
    }).catch((error) => {
        alert("Error: " + error.message);
    });
}

// Ensure the auth.html page loads first
window.onload = function() {
    toggleForm('signInForm'); // Show sign-in form by default
};

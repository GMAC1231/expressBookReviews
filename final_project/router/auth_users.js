const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
let books = require("./booksdb.js");

const regd_users = express.Router();
const SECRET_KEY = "fingerprint_customer";

// Users storage
let users = [];

// Function to check if a username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to check if username and password match
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Task 6: User Registration
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add user to users array
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});

// Task 7: User Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Validate user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    // Store token in session
    req.session.accessToken = accessToken;
    req.session.user = username;

    return res.status(200).json({ message: "Login successful", accessToken });
});

// Middleware to authenticate users
const authenticate = (req, res, next) => {
    if (!req.session || !req.session.accessToken) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    try {
        // Verify the session token
        jwt.verify(req.session.accessToken, SECRET_KEY);
        req.user = req.session.user;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid session. Please log in again." });
    }
};

// Task 8: Add or Modify a Book Review
regd_users.put("/auth/review/:isbn", authenticate, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Initialize reviews if not present
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Update or add the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Task 9: Delete a Book Review
regd_users.delete("/auth/review/:isbn", authenticate, (req, res) => {
    const { isbn } = req.params;
    const username = req.user;

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this book by the user" });
    }

    // Delete user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


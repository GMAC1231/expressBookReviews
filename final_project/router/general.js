const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js"); // Assuming books is a JSON object containing book details
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Register new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Task 10: Get the book list available in the shop (Using Async-Await)
public_users.get("/", async (req, res) => {
    try {
        const bookList = await new Promise((resolve) => {
            setTimeout(() => resolve(books), 1000);
        });
        return res.status(200).json({ books: bookList });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list" });
    }
});

// Task 11: Get book details based on ISBN (Using Promise Callback)
public_users.get("/isbn/:isbn", (req, res) => {
    const { isbn } = req.params;

    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    })
        .then((bookDetails) => res.status(200).json(bookDetails))
        .catch((error) => res.status(404).json({ message: error }));
});

// Task 12: Get book details based on author (Using Async-Await)
public_users.get("/author/:author", async (req, res) => {
    const { author } = req.params;
    try {
        const booksByAuthor = await new Promise((resolve, reject) => {
            const result = Object.values(books).filter((book) => book.author === author);
            if (result.length > 0) resolve(result);
            else reject("No books found by this author");
        });

        return res.status(200).json(booksByAuthor);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Task 13: Get all books based on title (Using Promise Callback)
public_users.get("/title/:title", (req, res) => {
    const { title } = req.params;

    new Promise((resolve, reject) => {
        const booksByTitle = Object.values(books).filter(
            (book) => book.title.toLowerCase() === title.toLowerCase()
        );

        if (booksByTitle.length > 0) resolve(booksByTitle);
        else reject("No books found with this title");
    })
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(404).json({ message: error }));
});

// Task 5: Get book reviews
public_users.get("/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;


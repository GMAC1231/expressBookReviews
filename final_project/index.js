const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true in production
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session exists and contains an access token
    if (!req.session || !req.session.accessToken) {
        return res.status(401).json({ message: "Access denied. Please log in." });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(req.session.accessToken, "fingerprint_customer");
        
        // Attach user details from token to request object
        req.user = decoded;
        
        next(); // Proceed to the next middleware or route
    } catch (error) {
        return res.status(403).json({ message: "Invalid session token. Please log in again." });
    }
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

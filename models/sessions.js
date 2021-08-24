require('dotenv').config()

const express = require('express')
const router = express.Router()

// mongodb
const session = require("express-session");
const MongoDBSession = require('connect-mongodb-session')(session);

const dbURI = `mongodb+srv://${process.env.MONGODB_CLIENT}:${process.env.MONGODB_SECRET}@cluster0.9gjz7.mongodb.net/spot-info?retryWrites=true&w=majority`;

// session
const store = new MongoDBSession({
    uri: dbURI,
    collection: "mySessions",
    expires: 3600000
});

/*let createSession = session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 3600000}
})*/

router.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 3600000}
}))

module.exports = router
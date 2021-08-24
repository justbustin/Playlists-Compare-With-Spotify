require('dotenv').config()

const express = require('express');
const logger = require("morgan");
const cors = require("cors");

// mongodb
const mongoose = require('mongoose');
const Account = require('./models/acc');

// gloabl object for token being used when not logged in
referenceData = {
    access_token: "",
    databaseID: ""
}

// express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// dev middleware
app.use(cors());
app.use(logger('dev'));

// sessions starter
app.use(require('./models/sessions'))
// sends static files such as js, css
app.use(express.static(__dirname + '/public'))
// controller that routes
app.use(require('./controllers'))

// connection to mongodb
const dbURI = `mongodb+srv://${process.env.MONGODB_CLIENT}:${process.env.MONGODB_SECRET}@cluster0.9gjz7.mongodb.net/spot-info?retryWrites=true&w=majority`;

// to fix the mongoose error stuff
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// connects DB and starts up server after connection begins
mongoose.connect(dbURI)
    .then(() => {
        Account.checkToken()
            .then(result => {
                referenceData = result
                
                app.listen(3000, () => {
                    console.log("server listening and db connected" + Date.now);
                })
            })
            .catch((err) => console.log("error: " + err))
});

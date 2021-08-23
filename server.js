// set up an authorization middleware to check for logged in or not
// set up ejs with if and else statements to see if person is authorized or not
// if authorized, display users playlists and all that jazz
// if not, then display normal page
// 


//ideas
// maybe instead of showing the similarities and differences on the same page,
// I could send user to a new page where that pgae will be a templated
// html with all the compared data
// that sounds mroe feasible and easier to do w/ animations or something
// then theres a button at the bottom or top to say go back and compare more

require('dotenv').config()

const express = require('express');
const api = require('./api');
const path = require('path');
const mainRoutes = require('./routes/mainRoutes');
const mongoose = require('mongoose');
const Account = require('./models/acc');
//const JWT = require('jsonwebtoken');
const { resolvePtr } = require('dns');
const session = require("express-session");
const { getSeveralArtists } = require('./api');
const MongoDBSession = require('connect-mongodb-session')(session);

const client = "46d2e73d137147a0b71385576ef05ba1";
//const secret = "1afc42f00a154ab49e809a8bac9b11d2";

const cookieSecret = process.env.COOKIE_SECRET;

//function to create token on server startup
async function callToken()
{
    const data = await api.token('client_credentials');
    console.log("calling token: " + data);
    //it returns json object so then parse and only get access token
    access_token = JSON.parse(data).access_token;
    console.log(access_token);
}



let access_token = "";
// for future reference to token databse
let databaseID = '';

// express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

// connect to mongodb
const dbURI = 'mongodb+srv://justbustin34:583351120Zvx@cluster0.9gjz7.mongodb.net/spot-info?retryWrites=true&w=majority';

// to fix the mongoose error stuff idk lol
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// connects DB but also starts up server after connection begins
mongoose.connect(dbURI)
    .then( (result) => {

        // retrieves array of collections in DB 
        Account.find()
        .then(async (result) => {
            console.log("Checking for undefined or not: " + result[0]);
            // if db is empty, will calltoken and save token in DB
            if (result[0] === undefined)
            {
                await callToken().catch((err) => console.log(err));
                const account = new Account({
                    token: access_token
                });
                account.save()
                    .then((result) => {
                        console.log("Saving:\n" + result);
                    })
            }
            // if db is not empty, wil set access_token var to the established token in DB 
            else if (result[0])
            {
                console.log("if have:\n" + result[0]);
                databaseID = result[0]._id;
                access_token = result[0].token;
            }
        })
        .then(() => {
            //starts up server after everything
            app.listen(3000, () => {
            console.log("server listening and db connected" + Date.now);
            })
        })
        .catch((err) => console.log("error: " + err))
});

const store = new MongoDBSession({
    uri: dbURI,
    collection: "mySessions",
    expires: 3600000
});

app.use(
    session({
        secret: cookieSecret,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: { maxAge: 3600000}
    })
)

//mongoose and mongo sandbox
    app.get('/blog', (req, res) => {
        Account.find().then(result => {
            res.send(result);
        })
    })

    //middleware to log requests
app.use(logger);

const isAuth = (req, res, next) =>
{
    if (req.session.isAuth) {
        next();
    }
    else
    {
        res.render('index', {session: ''});
    }
}

// calls index.html and all the stuff through router
// app.use("/", isAuth, mainRoutes);

// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get("/", isAuth, (req, res) => {
    
    if (!req.session.playlists)
    {
        api.getListPlaylists(req.session.accessToken, req.session.userID)
        .then((data) => {
            req.session.playlists = JSON.parse(data);

            res.render('index', { session: req.session });
        })
    }
    else{
        res.render('index', { session: req.session });
    }
})

app.get("/style.css", (req, res) => {
    res.sendFile('/style.css', { root: './views'});
})

app.get("/main.js", (req, res) => {
    res.sendFile('/main.js', { root: './'});
})

app.post("/testing", (req, res) => {
    //how object is:
    /*
    {
    name: "Who's Lovin' You - Stereo\nThe Temptations",
    value: {
      songName: "Who's Lovin' You - Stereo",
      artist: 'The Temptations',
      albumName: 'The Temptations Sing Smokey',
      songImg: 'https://i.scdn.co/image/ab67616d0000b2731a5b6271ae1c8497df20916e',
      artistID: '3RwQ26hR2tJtA8F9p2n7jG'
    }
  }
    */
   console.log(req.body)
   if (req.body.compare)
   {
       if (req.session.isAuth)
       {
           let tempArr = []
           for (let i = 0; i < req.body.artistSame.length; i++)
           {
               tempArr.push(req.body.artistSame[i].value.artistID)
           }
           getSeveralArtists(req.session.accessToken, tempArr).then(data => {
               let useful = JSON.parse(data)
               console.log(useful);

               res.render('realCompare.ejs', {data: req.body, artists: useful.artists});
           })
       }
       
       //res.render('realCompare.ejs', {data: req.body});
   }
   else
   {
       res.render('compare', { data: req.body.items });
   }
})

app.get("/login", (req, res) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${client}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-callback&scope=
                  user-follow-read%20user-top-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20playlist-read-collaborative%20user-library-read%20user-library-modify`);
})

// oauth call back get
app.get('/oauth-callback', (req, res) => {
    let code = req.query.code
    console.log("QUERY CODE GIVEN BACK: " + code);
    api.token('authorization_code', code)
        .then((respo) => {
            console.log(respo);
            let token = JSON.parse(respo);
            console.log(token);
            console.log("token.access_token:" + token.access_token);

            api.getUser(token.access_token).then(resp => {
                let obj = JSON.parse(resp);
                console.log("obj:" + obj);
                let userID = obj.id;
                req.session.accessToken = token.access_token;
                req.session.userID = userID;
                req.session.isAuth = true;
                req.session.dataXD = obj;

                console.log("userID:" + userID);
                res.redirect("/");
                
            })
            .catch(err => {
                console.log("err: " + err);
            })

        })
})

//calls about page
app.get('/about', (req, res) => {
    //res.send("<p> about page </p>");
    res.sendFile('./views/about.html', { root: __dirname });
})

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/");
    });
})

//redirects
app.get('/about-us', (req, res) => {
    res.redirect('/about');
})

// request for browser icon (don't have as of now)
app.get('/favicon.ico', (req, res) => {
    res.send(null);
})

// on api calls do this
app.get("/api/:id", (req, res, next) => {
    const playlistID = req.params.id;

    tokenBeingUsed = access_token;

    if (req.session.isAuth)
    {
        console.log("helloooooooo");
        tokenBeingUsed = req.session.accessToken;
    }

    console.log(" accesstoken: " + tokenBeingUsed + "....");

    // passes in access token and parameters given
    api.apiCall(tokenBeingUsed, playlistID)
    .then((data) => {
        res.set({ 'Content-Type': 'application/json'});
        res.send(data);
    })
    .catch(e => {
        // e is the object given back from my api code on .reject
        
        console.log("Error: ", e);
        const errorHandling = JSON.parse(e);

        //when token gets expired, creates new one and also saves to DB
        if (errorHandling.error.message == "The access token expired") 
        {
            callToken()
                .then(async () => {
                    await Account.updateOne({_id: databaseID}, {token: access_token});
                    console.log("updated???");
                })
        }

        res.sendStatus(404);
        return;
    });
})

// 404 page
app.use((req, res, next) => {
    next();
    console.log("inside error page middleware");
    res.status(404);
    res.sendFile('./views/404.html', { root: __dirname });
});

app.use((req, res) => {
    console.log("in middleware below evyerthing");
})


function logger(req, res, next)
{
    console.log("--------------------------------");
    console.log("New request made");
    console.log('host: ' + req.hostname);
    console.log(`path: ${req.path}`);
    console.log(`method: ${req.method}`);
    next();
}

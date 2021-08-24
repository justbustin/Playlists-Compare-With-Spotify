require('dotenv').config()

const express = require('express')
const router = express.Router()

const api = require('../api')

// login
router.get('/', (req, res) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Foauth-callback&scope=
    user-follow-read%20user-top-read%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20playlist-read-collaborative%20user-library-read%20user-library-modify`);
})

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/");
    });
})

router.get('/oauth-callback', (req, res) => {
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

module.exports = router
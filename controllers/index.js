const express = require('express')
const router = express.Router()

const api = require('../helpers/api')
const isAuth = require('../middlewares/isAuth')


router.use('/about', require('./about'))
router.use('/playlists', require('./playlists'))
router.use('/auth', require('./auth'))


router.get('/', isAuth, async (req, res) => {
    if (!req.session.playlists)
    {
        let data = await api.getListPlaylists(req.session.accessToken, req.session.userID)

        req.session.playlists = await JSON.parse(data);

        console.log("rendered index with playlists initalization")
        res.render('index', { session: req.session })
    }
    else{
        res.render('index', { session: req.session });
    }
})

// 404 page
router.use((req, res, next) => {
    next();
    console.log("inside error page middleware");
    res.status(404);
    res.sendFile('./public/404.html', { root: __dirname });
});

module.exports = router
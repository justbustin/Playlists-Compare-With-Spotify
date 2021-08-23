const express = require("express");
const path = require('path');
const router = express.Router();

// calls index.html
router.get("/",  (req, res) => {
    res.render('index', { session: req.session });
})

router.get("/style.css", (req, res) => {
    res.sendFile('/style.css', { root: './views'});
})

router.get("/main.js", (req, res) => {
    res.sendFile('/main.js', { root: './'});
})


module.exports = router;
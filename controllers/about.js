require('dotenv').config()

const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('about.ejs', {session: req.session})
})

module.exports = router;
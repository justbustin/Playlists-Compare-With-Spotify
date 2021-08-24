
module.exports = function(req, res, next) {
    if (req.session.isAuth) {
        next();
    }
    else
    {
        res.render('index', {session: ''});
    }
}


const express = require("express")
const usersRouter = express.Router()
const usersControllers = require('../controllers/usersControllers')
const passport = require("passport")

usersRouter.get('/signup', usersControllers.getSignUp)
usersRouter.post('/signup', usersControllers.createUser)
usersRouter.get('/login', usersControllers.getLogin)
usersRouter.post('/login', function (req,res,next){
        passport.authenticate('local', {successFlash: true, failureFlash: true, successRedirect: '/storage', failureRedirect: '/users/login'})(req, res, next)

})
usersRouter.get('/logout', usersControllers.logout)

module.exports = usersRouter
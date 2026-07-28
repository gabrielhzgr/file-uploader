const {body, validationResult, matchedData} = require('express-validator')
const prisma = require('../lib/prisma')
const supabase = require('../lib/supabase')
const bcrypt = require('bcrypt');

function getSignUp(req, res, next) {
  res.render("signUp", {title:'Sign Up'});
}

const validateUser = [
  body('username').trim()
    .isLength({min: 1, max: 255}).withMessage('Username must be 1 to 255 characters long')
    .custom(async (value, {req})=>{
        try {
            const user = await prisma.user.findFirst({where: {username: value}})
            if(user !== null){
              throw new Error('username already exists')
            }
        } catch (err) {
            throw err
        }
    }),
  body('password')
    .isLength({min: 1, max: 255}).withMessage('Username must be 1 to 255 characters long'),
  body('confirm-password')
    .custom((value, {req})=>{
      return value == req.body.password
    }).withMessage('Password and confirm password must match')
]

const createUser = [
  validateUser,
  async (req, res, next)=> {
    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        const errorMessages = errors.array().map(error=>error.msg)
        const flash = {type: 'error', messages: errorMessages}
        return res.status(400).render('signUp', {title:'Sign Up', flash})
      }
      const {username, password} = matchedData(req)
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = await prisma.user.create({data: {username, password: hashedPassword}})
      await prisma.folder.create({data: {name: 'My Storage', ownerId: newUser.id}}) //New root folder
      await supabase.storage.createBucket(newUser.id)
      req.flash('success', `Signed Up for user:  ${newUser.username} was succesful`)
      res.redirect('/users/login')
    } catch (err) {
      next(err)
    }
}]

function getLogin(req, res, next){

    let flashSuccess, flashError

    let successMessages = req.flash('success') 
    if(successMessages.length>0){
        flashSuccess = {type: 'success', messages: successMessages }
    }

    let errorMessages = req.flash('error')
    if(errorMessages.length>0){
        flashError = {type: 'error', messages: errorMessages}
    }

    res.render('login', {title: 'Login', flashSuccess, flashError})
}

function logout(req, res, next){
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        res.redirect('/storage')
    })
}

module.exports = {createUser, getSignUp, getLogin, logout}
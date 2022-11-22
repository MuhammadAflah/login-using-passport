if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt=require('bcrypt')
const passport = require('passport')  //middleware used for authentication
const flash = require('express-flash') //to define a flash message
const session = require('express-session')
const methodOverride = require('method-override')
const createError = require('http-errors')


const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email=> users.find(user => user.email === email),
    id => users.find(user => user.id === id),
  )

const users =[]

app.set('view-engine', 'ejs')
// app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

// caching disabled for every route
app.use((req, res, next)=> {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });


app.use(session({

    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false
}))
app.use(express.urlencoded({extended:false}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))




app.get('/',checkAuthenticated,(req,res)=>{
    //req.session.destroy()
   res.render('index.ejs', {name:req.user.name})
})

app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs')
})
app.post('/login',checkNotAuthenticated, passport.authenticate('local',{
    successRedirect : '/',
    failureRedirect: '/login',
    failureFlash:true
}))
app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs')
})
app.post('/register',checkNotAuthenticated, async(req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword
        })
        // console.log(users);
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
})



// app.delete('/logout', function(req, res, next) {
//     //req.session.destroy()
//     req.logout(function(err) {
//       if (err) { return next(err) }
//       res.redirect('/login');
//     });
//   });

app.delete('/logout', function(req, res, next) {    
        req.logout(function(err) {
            if (err) { return next(err) }
            res.redirect('/login');
        })

});

function checkAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.use(function(req, res, next) {
    next(createError(404));
  });

app.listen(3000,()=>{
    console.log('server started');
})




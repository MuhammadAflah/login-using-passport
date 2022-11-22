const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")

function initialize(passport,getUserByEmail,getUSerById) {
    //function to authenticate user
    const authenticateUser = async (email, password, done) => {
        //get user by email
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: "No user found with this email" })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            }else{
                return done(null,false,{message: "password incorrect"})
            }
        } catch (e) {
            console.log(e);
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' },authenticateUser))
    passport.serializeUser(( user, done ) => done(null,user.id))
    passport.deserializeUser(( id, done ) => {
        return done(null,getUSerById(id))
    })

}
module.exports=initialize
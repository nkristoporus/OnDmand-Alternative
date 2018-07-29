const LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user.js');

module.exports = passport => {
  // sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // pass entire request to callback
  },
  (req, email, password, done) => {

    process.nextTick(() => {
      // find user with email same as form email
      User.findOne({
        'local.email': email
      }, (err, user) => {
        if (err)  return done(err);

        // if user with that email
        if (user) {
          return done(null, false, req.flash("signupMessage", "That email is already taken"));
        } else {
          // if no user with email
          // create the user
          const newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.local.name = req.body.name;
          newUser.local.age = req.body.age;
          newUser.local.gender = req.body.gender;
          newUser.local.edu = req.body.edu;
          newUser.local.phone = req.body.phone;
          newUser.local.job1 = req.body.job1;
          newUser.local.role1 = req.body.role1;
          newUser.local.description1 = req.body.description1;
          newUser.local.job2 = req.body.job2;
          newUser.local.description2 = req.body.description2;
          newUser.local.role2 = req.body.role2;
          newUser.local.job3 = req.body.job3;
          newUser.local.role3 = req.body.role3;
          newUser.local.description3 = req.body.description3;
          // save usernameField
          newUser.save(err => {
            if (err) throw err;
            return done(null, newUser)
          });
        }

      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  }, (req, email, password, done) => { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email' :  email }, (err, user) => {
          // if there are any errors, return the error before anything else
          if (err)
              return done(err);

          // if no user is found, return the message
          if (!user)
              return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

          // if the user is found but the password is wrong
          if (!user.validPassword(password))
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, user);
      });

  }));

};

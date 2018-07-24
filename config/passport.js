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

          // save usernameField
          newUser.save(err => {
            if (err) throw err;
            return done(null, newUser)
          });
        }

      });
    });
  }));

  // login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, email, password, done) => {
    User.findOne({ 'local.email': email }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, req.flash('loginMessage', 'No user found.'));
    })
  }
))

};

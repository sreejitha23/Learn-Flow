const passport = require("passport");
const mongoose = require("mongoose");
require("dotenv").config(); // <-- ADDED THIS LINE

const User = mongoose.model("users");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy( // Tells passport to use google for authentication
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // <-- CHANGED THIS LINE
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // <-- CHANGED THIS LINE
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // <-- CHANGED THIS LINE
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      };

      try {
        let user = await User.findOne({ googleID: profile.id });
        if (user) {
          // User Exists
          console.log("Exist", user);
          done(null, user); //goes to serializeUser function(below).done takes error and user.
        } else {
          // Sign up for the first time
          user = await User.create(newUser);
          console.log("New", user);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

// (The rest of your file is perfect, no changes needed)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
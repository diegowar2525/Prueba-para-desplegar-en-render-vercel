const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/google/callback',
      proxy: true // Needed for deployment on Render/Heroku (HTTPS forwarding)
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

        // 1. Search by Google ID
        let user = await User.findOne({ googleId });
        if (user) {
          return done(null, user);
        }

        // 2. Search by Email (to link accounts if signed up locally first)
        user = await User.findOne({ email });
        if (user) {
          user.googleId = googleId;
          if (!user.avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        // 3. Create new user
        user = new User({
          name,
          email,
          googleId,
          avatar
        });
        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// We still configure serialize/deserialize for Passport completeness, even though we use session: false
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

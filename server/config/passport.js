const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');

function configurePassport(db) {
  // --- Local strategy (email/password) ---
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        // Compare hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) return done(err);
          return isMatch ? done(null, user) : done(null, false);
        });
      });
    }
  ));

  // --- Google OAuth ---
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    db.get('SELECT * FROM users WHERE googleId = ?', [profile.id], (err, user) => {
      if (err) return done(err);
      if (!user) {
        db.run('INSERT INTO users (googleId, name, avatar, email) VALUES (?, ?, ?, ?)',
          [profile.id, profile.displayName, profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null, email],
          function(err) {
            if (err) return done(err);
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              if (err) return done(err);
              return done(null, newUser);
            });
          }
        );
      } else {
        db.run('UPDATE users SET name = ?, avatar = ?, email = ? WHERE id = ?',
          [profile.displayName, profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null, email, user.id],
          (err) => {
            if (err) return done(err);
            db.get('SELECT * FROM users WHERE id = ?', [user.id], (err, updatedUser) => {
              if (err) return done(err);
              return done(null, updatedUser);
            });
          }
        );
      }
    });
  }));

  // --- Facebook OAuth ---
  passport.use(new FacebookStrategy({
    clientID: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, (accessToken, refreshToken, profile, done) => {
    db.get('SELECT * FROM users WHERE facebookId = ?', [profile.id], (err, user) => {
      if (err) return done(err);
      const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
      if (!user) {
        db.run('INSERT INTO users (facebookId, name, avatar) VALUES (?, ?, ?)',
          [profile.id, profile.displayName, avatarUrl],
          function(err) {
            if (err) return done(err);
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              if (err) return done(err);
              return done(null, newUser);
            });
          }
        );
      } else {
        db.run('UPDATE users SET name = ?, avatar = ? WHERE id = ?',
          [profile.displayName, avatarUrl, user.id],
          (err) => {
            if (err) return done(err);
            db.get('SELECT * FROM users WHERE id = ?', [user.id], (err, updatedUser) => {
              if (err) return done(err);
              return done(null, updatedUser);
            });
          }
        );
      }
    });
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      done(err, user);
    });
  });
}

module.exports = configurePassport;
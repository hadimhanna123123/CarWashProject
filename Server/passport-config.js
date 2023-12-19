const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initializePassport(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (ClientEmail, ClientPassword, done) => {
    const user = await getUserByEmail(ClientEmail);

    if (!user) {
      return done(null, false, { message: 'No user with that email' });
    }
    console.log(ClientPassword)
    console.log(user.ClientPassword)
const passmatch=await bcrypt.compare(ClientPassword, user.ClientPassword)
    try {
      if (passmatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  
  // Serialize user to store in the session
  passport.serializeUser((user, done) => done(null, user.ClientId));

  // Deserialize user to fetch from the session
  passport.deserializeUser(async (ClientId, done) => {
    const user = await getUserById(ClientId);

    if (!user) {
      return done(null, false, { message: 'No user with that id' });
    }

    return done(null, user);
  });
}

module.exports = initializePassport;

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/usersModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authConfig from './authConfig';

const JWT_SECRET = 'MY_JWT_SECRET_KEY';

console.log('auth', authConfig)

passport.use(new GoogleStrategy({
  clientID: authConfig.googleClientID,
  clientSecret: authConfig.googleClientSecret,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    let isNewUser = false;

    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';


    if (!user) {
      // Create a new user if not found
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
      });
      isNewUser = true;
    }

    // Generate JWT access token and refresh token
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
   

    // Store the hashed refresh token in the user document
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();
    
    return done(null, { userId: user._id, accessToken, refreshToken, isNewUser } );
  } catch (error) {
    return done(error);
  }

}));

passport.serializeUser((user: any, done) => {
  console.log('User object:', user);
  done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user: IUser | null = await User.findById(userId);
    done(null, user || undefined);
  } catch (error) {
    done(error, undefined);
  }
});

export default passport;


//const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';

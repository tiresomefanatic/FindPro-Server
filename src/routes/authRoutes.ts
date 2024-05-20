 import express from 'express';
import passport from '../auth/passport';
import User from '../models/usersModel';

const router = express.Router();

declare module 'express-session' {
    interface Session {
      fromPage?: string,
      userData: {
        id: string,
        name: string,
        isNewLogin: string

      },
      isLoginOk: string,
    }
  }

router.get('/google-login', (req, res) => {
  const fromPage = JSON.stringify(req.query.fromPage) as string;
 
  req.session.fromPage = fromPage;
  //console.log('req query object frompage session' +  req.session.fromPage)
  res.redirect('/auth/google');
});


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));








router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
  (req, res) => {
    try {
        const { accessToken, refreshToken, isNewUser } = req.user;
  
        // Set the tokens as HTTP-only cookies
        res.cookie('accessToken', accessToken, { sameSite: 'none', secure: true});
        res.cookie('refreshToken', refreshToken, { sameSite: 'none', secure: true});
  
        if (isNewUser) {
          // Redirect to the registration page for new users
          res.redirect('http://localhost:3000/register');
        } else {
          // Redirect to the login success page for existing users
          res.redirect('http://localhost:3000/loginSuccess');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
);






















// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/handle-google-login' }),
//   (req, res) => {
//     try {
//       console.log('Authentication successful:', req.user);
//       req.session.isLoginOk = 'true'
//       req.session.userData = req.user
//       res.redirect('http://localhost:8080/auth/handle-google-login'); // Redirect to your frontend after successful authentication
//     } catch (error) {
//       console.error('Authentication error:', error);
//       res.status(500).json({ error: 'Max Internal Server Error' });
//     }
//   }
// );



// router.get('/handle-google-login', (req, res) => {
//     const isLoginOK = req.session.isLoginOk === 'true';
//     const googleUser = req.session.userData;
//     const fromPage = req.session.fromPage;

//    //console.log("handle-google-login req.session", req.session)
//    console.log('req query  frompage session' +  req.session.fromPage)

  
//     if (isLoginOK) {
//       if (googleUser.isNewLogin) {
//         // Redirect to the page with additional fields for new users
//         res.redirect('http://localhost:3000/register');
//       } else {
//         // Redirect to the page for existing users
//         res.redirect(`http://localhost:3000/`);
//       }
//     } else {
//       // Handle login failure
//       res.redirect('http://localhost:3000/login?error=true');
//     }
//   });


































export default router;



























// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/handle-google-login' }),
//   (req, res) => {
//     try {
//      // console.log('Authentication successful:', req.user);
//       req.session.isLoginOk = 'true'
//       req.session.userData = req.user
//       res.redirect('http://localhost:8080/auth/handle-google-login'); // Redirect to your frontend after successful authentication
//     } catch (error) {
//       console.error('Authentication error:', error);
//       res.status(500).json({ error: 'Max Internal Server Error' });
//     }
//   }
// );



// router.get('/handle-google-login', (req, res) => {
//     const isLoginOK = req.session.isLoginOk === 'true';
//     const googleUser = req.session.userData;
//     const fromPage = req.session.fromPage;

//    //console.log("handle-google-login req.session", req.session)
//    console.log('req query  frompage session' +  req.session.fromPage)

  
//     if (isLoginOK) {
//       if (googleUser.isNewLogin) {
//         // Redirect to the page with additional fields for new users
//         res.redirect('http://localhost:3000/register');
//       } else {
//         // Redirect to the page for existing users
//         res.redirect(`http://localhost:3000/`);
//       }
//     } else {
//       // Handle login failure
//       res.redirect('http://localhost:3000/login?error=true');
//     }
//   });



























































// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/loginerror' }),
//   (req, res) => {
//     try {
//          const user = req.user;
//         const accessToken = user.accessToken;
//         const refreshToken = user.refreshToken;
//         const isNewUser = user.isNewUser;
  
//         const redirectUrl = isNewUser
//           ? `http://localhost:3000/register?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&isNewUser=true`
//           : `http://localhost:3000/loginSuccess?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;
  
//         res.redirect(redirectUrl);
//        } catch (error) {
//          console.error('Authentication error:', error);
//          res.status(500).json({ error: 'Internal Server Error' });
//        }
//     }
// );


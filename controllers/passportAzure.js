const AzureStrategy = require('passport-azure-ad-oauth2').Strategy
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User')

const {AZURE_CLIENTID, AZURE_CLIENTSECRET} = process.env;

module.exports = function (passport) {
  passport.use(
    new AzureStrategy({
        clientID: AZURE_CLIENTID,
        clientSecret: AZURE_CLIENTSECRET,
        callbackURL: '/auth/redirect',
    },
    async (accessToken, refreshToken, params, provider, done) => {
        const profile = jwt.decode(accessToken);
        if (process.env.NODE_ENV !== 'production'){
            console.log({
                jwt: jwt.decode(accessToken), 
                params, 
                provider
            });
        }
        try {
            let user = await User.findOne({upn: profile.upn});
            if (user){
                //Update user
                user.last_login = Date.now();
                await user.save();
            }
            else {
                user = await  User.create({
                    upn: profile.upn,
                    name: profile.name,
                    given_name: profile.given_name,
                    family_name: profile.family_name
                });
            }
            done(null, user);
        } catch (e) {
            console.log(e);
            done(e, null);
        }

        
        
          //done(null, null);
          /*
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
        }

        try {
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            done(null, user)
          } else {
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }*/
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
}
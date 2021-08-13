const AzureStrategy = require('passport-azure-ad-oauth2').Strategy
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User')

const {AZURE_CLIENTID, AZURE_CLIENTSECRET, NODE_ENV,HOST_URL} = process.env;
const {getAgentWithEmail} = require('./getTeleoptiData');
const {getUserById} = require('./getUserData');

module.exports = function (passport) {
  passport.use(
    new AzureStrategy({
        clientID: AZURE_CLIENTID,
        clientSecret: AZURE_CLIENTSECRET,
        callbackURL: HOST_URL + '/auth/redirect',
        resource: '00000003-0000-0000-c000-000000000000'
    },
    async (accessToken, refreshToken, params, provider, done) => {
        const profile = jwt.decode(accessToken);
        if (NODE_ENV !== 'production'){
            console.log({
                jwt: jwt.decode(accessToken),
                accessToken
            });
        }
        try {
            let agent = await getAgentWithEmail(profile.upn);
            console.log(agent);
            let agentId = null;
            if (agent){
              agentId = agent._id;
            }
            
            let user = await User.findById(profile.upn);
            if (user){
                //Update user
              user = await User.findByIdAndUpdate(profile.upn, {
                last_login: Date.now(),
                agentId
              }, {new: true})
            }
            else {
                user = await  User.create({
                    _id: profile.upn,
                    name: profile.name,
                    agentId,
                    given_name: profile.given_name,
                    family_name: profile.family_name
                });
            }
            if ( NODE_ENV != 'Production' ){
              getUserById(user._id).then(saved_user=>console.log(saved_user));
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
const AzureStrategy = require('passport-azure-ad-oauth2').Strategy
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User')
const request = require('request-promise');
const Access = require('../models/Access');
const {logStd, logTab, logErr} = require('./logger');

const {AZURE_CLIENTID, AZURE_CLIENTSECRET, NODE_ENV,HOST_URL} = process.env;
const {getAgentWithEmail} = require('./getTeleoptiData');
const {getUserById} = require('./getUserData');

const { getProfileData} = require('./config');

const genAccessLevel = (label='Alerts', alter='root', path)=>{
  if (!path){
    path = `/${label.toLowerCase()}/${alter}`
  }
  return {
    label,
    path,
    alter
  }
}

const generateCustomAccess = async (role, title, upn)=>{
  const custom_access = [];
  const accesses = await Access.find();
  const alerts = []

  accesses.forEach(access=>{
    let hasAccess = []
    access.rule.forEach((value, key)=>{
      //logTab({key, value, role, title, upn}, 'Rule map');
      if ( key === 'role' ) hasAccess.push(role === value);
      if ( key === 'title' ) hasAccess.push(title === value);
      if ( key === 'upn' ) hasAccess.push(upn === value);
    })
    /*logStd(hasAccess);
    logStd(hasAccess.length);
    logStd(hasAccess.indexOf(false));*/
    const grantedAccess = hasAccess.length > 0 && hasAccess.indexOf(false) < 0;
    //logStd(`Granted Access:  ${grantedAccess}`)
    if (grantedAccess){
      access.grant.forEach(ca=>{
        custom_access.push(genAccessLevel(ca.label, ca.alter, ca.path));
      });
      if (access.alerts) alerts = [...alerts, ...access.alerts]
    }
  })




  return {alerts, custom_access};
}

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
            /*const photoQuery = {...getPhoto};
            photoQuery.headers["Authorization"] = 'Bearer ' + accessToken;
            const photo = Buffer.from(await request(photoQuery)).toString('base64');
            profile.photo = photo;*/
            const profileQuery = {...getProfileData}
            profileQuery.headers["Authorization"] = 'Bearer ' + accessToken;
            const graphProfile = JSON.parse(await request(profileQuery));
            const {state, jobTitle} = graphProfile;
            //console.log({graphProfile});
            let agent = await getAgentWithEmail(profile.upn);
            //console.log(agent);
            let agentId = null;
            if (agent){
              agentId = agent._id;
            }

            const {custom_access, alerts} = await generateCustomAccess(state, jobTitle, profile.upn);
            
            let user = await User.findById(profile.upn);
            if (user){
                //Update user
              user = await User.findByIdAndUpdate(profile.upn, {
                last_login: Date.now(),
                agentId,
                //photo,
                role: state,
                title: jobTitle,
                access_token: accessToken,
                custom_access,
                alerts
              }, {new: true})
            }
            else {
                user = await  User.create({
                    _id: profile.upn,
                    name: profile.name,
                    agentId,
                    //photo,
                    role: state,
                    title: jobTitle,
                    given_name: profile.given_name,
                    family_name: profile.family_name,
                    access_token: accessToken,
                    custom_access,
                    alerts
                });
            }
            if ( NODE_ENV != 'Production' ){
              //getUserById(user._id).then(saved_user=>console.log(saved_user));
            }
            done(null, user);
        } catch (e) {
            logErr(e);
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
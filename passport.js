'use strict';

const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');

module.exports = () => {

  passport.use(new TwitterTokenStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      includeEmail: true
    },
    (token, tokenSecret, profile, done) => {
      let userinfo = {
        displayName: profile.displayName,
        id: profile.id,
        username: profile.username
      };
      return done(null, userinfo);
    }));

};
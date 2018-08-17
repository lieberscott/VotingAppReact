const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const mongo = require('mongodb').MongoClient;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require('mongodb').ObjectID;
const passport = require('passport');
const request = require('request');

const passportConfig = require('./passport');
passportConfig();

// cors
const cors = require('cors');
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};

// jsonwebtokens functions
const createToken = (auth) => {
  console.log("createtoken auth : ", auth);
  return jwt.sign({ id: auth.id }, process.env.SECRET, { expiresIn: "10h" });
};

const generateToken =  (req, res, next) => {
  req.token = createToken(req.auth);
  return next();
};

const sendToken = (req, res) => {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

const authenticate = expressJwt({
  secret: process.env.SECRET,
  requestProperty: 'auth',
  getToken: (req) => {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  }
});

app.use(cors(corsOption));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.static('public'));

app.enable('trust proxy'); 

let PollSchema = new Schema({
  title: { type: String, required: true },
  answers: [{
    option: { type: String },
    votes: { type: Number },
    _id: false
  }],
  created_by: { type: String, required: true },
  details: {
    display_name: { type: String },
    username: { type: String },
    provider: { type: String }
  },
  date_added: { type: Date, default: new Date() },
  answeredIPs: [String],
  answeredUsers: [String]
});

let Poll = mongoose.model("Poll", PollSchema);

// app.set('view engine', 'pug');

mongo.connect(process.env.DATABASE, { useNewUrlParser: true }, (err, client) => {
  
  if (err) { console.log(err); }
  else {
    
    let db = client.db('freecodecamp2018');
    
    app.route('/auth/twitter/reverse')
    .post((req, res) => {
      request.post({
        url: 'https://api.twitter.com/oauth/request_token',
        oauth: {
          oauth_callback: "http://right-recorder.me/auth/twitter", // /callback
          consumer_key: process.env.TWITTER_CONSUMER_KEY,
          consumer_secret: process.env.TWITTER_CONSUMER_SECRET
        }
      }, (err, r, body) => {
        if (err) { return res.send(500, { message: err.message }); }

        let jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        res.send(JSON.parse(jsonStr));
      });
    });

    app.route('/auth/twitter')
    .post((req, res, next) => {
      request.post({
        url: 'https://api.twitter.com/oauth/access_token?oauth_verifier',
        oauth: {
          consumer_key: process.env.TWITTER_CONSUMER_KEY,
          consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
          token: req.query.oauth_token
        },
        form: { oauth_verifier: req.query.oauth_verifier }
      }, (err, r, body) => {
        if (err) { return res.send(500, { message: err.message }); }

        const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        const parsedBody = JSON.parse(bodyString);

        req.body['oauth_token'] = parsedBody.oauth_token;
        req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
        req.body['user_id'] = parsedBody.user_id;

        next();
      });
    }, passport.authenticate('twitter-token', {session: false}), (req, res, next) => {
        if (!req.user) {
          return res.send(401, 'User Not Authenticated');
        }

        // prepare token for API
        req.auth = {
          id: req.user.id
        };

        return next();
    }, generateToken, sendToken);
    
    app.route("/createpoll")
    .post(verifyToken, async (req, res) => {
      
      let user_id = "";
      let display_name = "";
      let username = "";
      let email = "";
      let verified = false;
      
      
      jwt.verify(req.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        else {
          console.log("authdata : ", authData);
          verified = true;
          user_id = authData.user_id;
          display_name = authData.displayName;
          username = authData.username;
        }
      })
      
      // FOR FORM TO WORK: in server.js file
      // Need body-parser
      // Need app.use(bodyparser.urlencoded({ extended: true }));
      // Not for this app, but for others, you may need app.use(bodyParser.json());    
      let regex = /\r\n?|\n/g; // \r, \r\n, or \n (line break varies based on operating system)
      let title = req.body.title;
      let string = req.body.answers;
      let answers = string.split(regex); // array
      let provider = "twitter";

      let answersArr = [];
      let obj;

      for (let i = 0; i < answers.length; i++) {
        obj = {};
        obj.option = answers[i];
        obj.votes = 0;
        answersArr.push(obj);
      }
      
      if (verified) {

        let newentry = new Poll({
          title,
          answers: answersArr,
          created_by: user_id,
          details: {
            display_name,
            username,
            email,
            provider
          }
        });

        let result = await newentry.save((err, data) => {
          if (err) { console.log(err) }
          else { return res.status(200).send({ result: "success" }); } // will be sent to ajax request for redirect to profile page
        });
      }
    });
    
    app.route("/findpoll/:pollnumber")
    .get(async (req, res) => {
      
      let search = req.params.pollnumber;
      let poll = [];

      let cursor = await db.collection('polls').find({ _id: ObjectId(search) }).project({ details: 0 }); // in Mongo, project is how to return specified fields
      cursor.forEach((doc) => poll.push(doc), () => {
        res.send({ poll });
      });
    });
    
    app.route("/getip")
    .get((req, res) => {
      let ip = req.ip;
      res.send({ ip });
    });

    app.route("/getpolls")
    .get(async (req, res) => {
      let polls = [];
      let cursor = await db.collection('polls').find({}).project({ title: 1 }); // in Mongo, project is how to return specified fields
      cursor.forEach((doc) => polls.push(doc), () => {
        res.send({ polls });
      });
    });
    
    app.route("/logout")
    .get((req, res) => {
      req.logout();
      res.redirect("/");
    })
    
    app.get("*", (req, res) => {
      let ip = req.ip;
      res.sendFile(__dirname + '/app/index.html', { ip });
    });
  }
  
  function verifyToken(req, res, next) { // middelware to prevent user from manually typing into address bar url.com/profile
    const bearerHeader = req.headers['authorization'];
    console.log(req.headers);
    console.log(bearerHeader);
    
    if (bearerHeader != undefined) {
      const bearer = bearerHeader.split(' ');
      console.log(bearer);
      const bearerToken = bearer[1];
      req.token = bearerToken;
      return next();
    }
    else {
      res.sendStatus(403);
    }
  };
  
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

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

// cors
const cors = require('cors');
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};

const passportConfig = require('./passport');
passportConfig();


// jsonwebtokens functions
const createToken = (auth) => {
  console.log("createtoken auth : ", auth);
  return jwt.sign({ id: auth.id, displayName: auth.displayName, username: auth.username }, process.env.SECRET, { expiresIn: "10h" });
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

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });

mongo.connect(process.env.DATABASE, { useNewUrlParser: true }, (err, client) => {
  
  if (err) { console.log(err); }
  else {
    
    let db = client.db('freecodecamp2018');
    
    app.route('/answer')
    .post(/* verifyToken, */(req, res) => {
      /* req.headers.authorization is the jwt token */
      /* header 'authorization' was set in the Chart component, in the onSubmit function */
      /* we use jwt.verify to decode the info we need from the token,
         since we are not using sessions (for simplicity) */
      
      let id = "";
      let display_name = "";
      let username = "";
      let verified = false;
      
      jwt.verify(req.headers.authorization, process.env.SECRET, (err, authData) => {
        if (err) {
          console.log("verify err");
        }
        else {
          verified = true;
          id = authData.id;
          display_name = authData.displayName;
          username = authData.username;
        }
      })

      let referer = req.headers.referer; // url, which includes the mongo ID at the end
      let regex = /polls\//; // regex to split the url to isolate the mongo ID
      let poll_id = referer.split(regex)[1];

      let answer = req.headers.answer;
      let ip = req.ip;

      let poll = Poll.findByIdAndUpdate(poll_id, { $addToSet: { answeredIPs: ip, answeredUsers: id } }, (err, data) => {
        if (err) {
          console.log(err);
          res.sendStatus(403);
        }
        else {
          let answers = data.answers;
          let len = answers.length;
          let add = true; // add the answer to the array, pending results of ensuing for-loop

          // check all the answers in database, if one is equal to the new answer submitted, change add to false and increment vote total
          for (let i = 0; i < len; i++) {
            if (answers[i].option == answer) {
              answers[i].votes = answers[i].votes + 1;
              add = false;
              break;
            }
          }

          if (add) { // user-generated answer is not already in database
            answers.push({ option: answer, votes: 1 });
          }

          data.save();
          res.json({ result: "success" });
        }
      })
    });

    app.route('/auth/twitter/reverse')
    .post((req, res) => {
      request.post({
        url: 'https://api.twitter.com/oauth/request_token',
        oauth: {
          oauth_callback: "http://voting-machine.me/auth/twitter", // /callback
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
          id: req.user.id,
          displayName: req.user.displayName,
          username: req.user.username
        };

        return next();
    }, generateToken, sendToken);
    
    
    app.route("/createpoll")
    .post(/* verifyToken, */ (req, res) => {

      let id = "";
      let display_name = "";
      let username = "";
      let email = "";
      let verified = false;
      
      jwt.verify(req.headers.authorization, process.env.SECRET, (err, authData) => {
        if (err) {
          console.log("Error");
          res.sendStatus(403);
        }
        else {
          verified = true;
          id = authData.id;
          display_name = authData.displayName;
          username = authData.username;
        }
      })
      
      let title = req.headers.title;
      let string = req.headers.answers;
      let answers = string.split(",");
      
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
          created_by: id,
          details: {
            display_name,
            username,
            email,
            provider
          }
        });

        let result = newentry.save((err, data) => {
          if (err) { console.log(err) }
          else { return res.status(200).send({ result: "success" }); }
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
      let cursor = await db.collection('polls').find({}).project({ title: 1, answers: 1 }); // in Mongo, project is how to return specified fields
      cursor.forEach((doc) => polls.push(doc), () => {
        res.send({ polls });
      });
    });
    
    app.route("/mypolls/:userid")
    .get(async (req, res) => {
      let userid = req.params.userid;
      let polls = [];
      let cursor = await db.collection('polls').find({ created_by: userid }).project({ title: 1, answers: 1 }); // in Mongo, project is how to return specified fields
      cursor.forEach((doc) => polls.push(doc), () => {
        res.send({ polls });
      });
    });


    // http://expressjs.com/en/starter/basic-routing.html
    app.get("*", function(request, response) {
      response.sendFile(__dirname + '/app/index.html');
    });
  }
})

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
  

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
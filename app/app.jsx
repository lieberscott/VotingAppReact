const React = require('react');
const ReactDOM = require('react-dom');
const Route = require('react-router-dom').Route;
const BrowserRouter = require('react-router-dom').BrowserRouter;
const hashHistory = require('react-router-dom').hashHistory;

/* Import Components */
const HelloWorld = require('./components/HelloWorld');
const Newpoll = require('./components/Newpoll');
const Chart = require('./components/Chart');
const Top = require('./components/Top');

const local = localStorage.getItem('poll-login');

let loggedIn = false;
let name = "";
let token = "";
let twitter_id;

if (local) {
  console.log("local");
  let info = JSON.parse(local);
  loggedIn = true;
  name = info.name;
  token = info.token;
  twitter_id = info.twitter_id;
};

ReactDOM.render((
  <BrowserRouter>
    <div>
      <Top loggedIn={ loggedIn } name={ name } token={ token } />
      <Route exact path="/" component={ HelloWorld } />
      <Route exact path="/newpoll" component={ Newpoll } loggedIn={ loggedIn } name={ name } token={ token } />
      <Route exact path="/polls/:pollnumber" component={ Chart } loggedIn={ loggedIn } name={ name } token={ token } />
    </div>
  </BrowserRouter>), document.getElementById('main'));
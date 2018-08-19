const React = require('react');
const { render } = require('react-dom');

// router
const Route = require('react-router-dom').Route;
const BrowserRouter = require('react-router-dom').BrowserRouter;
const hashHistory = require('react-router-dom').hashHistory;

// redux
const { createStore } = require('redux');
const { Provider } = require('react-redux');
const userinfo = require('./reducers');

let store = createStore(userinfo);

/* Import Components */
const App = require('./components/App');
const ChartContainer = require('./containers/ChartContainer');
const NewpollContainer = require('./containers/NewpollContainer');

render((
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route exact path="/" component={App}/>
        <Route path="/polls/:pollnumber" component={ChartContainer}/>
        <Route path="/newpoll" component={NewpollContainer}/>
      </div>
    </BrowserRouter>
  </Provider>), document.getElementById('main'));
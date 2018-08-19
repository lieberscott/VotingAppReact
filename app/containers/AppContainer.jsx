const { connect } = require('react-redux');
const actions = require('../actions');
const App = require('../components/App');

const mapAppStateToProps = function(state) {
  return {
    loggedIn: state.loggedIn,
  }
}

const mapAppDispatchToProps = function(dispatch) {
  return {
    /* none */
  }
}

const AppContainer = connect(
  mapAppStateToProps,
  mapAppDispatchToProps
)(App);

module.exports = AppContainer;
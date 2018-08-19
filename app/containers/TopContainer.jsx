const { connect } = require('react-redux');
const actions = require('../actions');
import Top from '../components/Top';

const mapTopStateToProps = function(state) {
  return {
    loggedIn: state.loggedIn,
    token: state.token,
    user: state.user,
    name: state.name
  }
}

const mapTopDispatchToProps = function(dispatch) {
  return {
    login: function(token, user, name) {
      dispatch(actions.login(token, user, name))
    },
    logout: function() {
      dispatch(actions.logout())
    }
  }
}

const TopContainer = connect(
  mapTopStateToProps,
  mapTopDispatchToProps
)(Top);

module.exports = TopContainer;
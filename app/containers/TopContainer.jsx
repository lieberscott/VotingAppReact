/* container which maps state and dispatches to its props 
  so it can be referenced in the VoteButtons component */

const { connect } = require('react-redux');
const actions = require('../actions');
import Top from '../components/Top';

const mapTopStateToProps = function(state) {
  return {
    loggedIn: state.loggedIn,
    token: state.token,
    user: state.user
  }
}

const mapTopDispatchToProps = function(dispatch) {
  return {
    login: function(token, user) {
      dispatch(actions.login(token, user))
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
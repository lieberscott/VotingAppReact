const { connect } = require('react-redux');
const actions = require('../actions');
const Newpoll = require('../components/Newpoll');

const mapNewpollStateToProps = function(state) {
  return {
    token: state.token,
  }
}

const mapNewpollDispatchToProps = function(dispatch) {
  return {
    /* none */
  }
}

const NewpollContainer = connect(
  mapNewpollStateToProps,
  mapNewpollDispatchToProps
)(Newpoll);

module.exports = NewpollContainer;
const { connect } = require('react-redux');
const actions = require('../actions');
const Chart = require('../components/Chart');

const mapStateToProps = function(state) {
  return {
    loggedIn: state.loggedIn,
    token: state.token,
    user: state.user
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    /* none */
  }
}

const ChartContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);

module.exports = ChartContainer;
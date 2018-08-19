const { connect } = require('react-redux');
const actions = require('../actions');
const Mypolls = require('../components/Mypolls');

const mapMypollsStateToProps = function(state) {
  return {
    user: state.user,
  }
}

const mapMypollsDispatchToProps = function(dispatch) {
  return {
    /* none */
  }
}

const MypollsContainer = connect(
  mapMypollsStateToProps,
  mapMypollsDispatchToProps
)(Mypolls);

module.exports = MypollsContainer;
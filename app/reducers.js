/* reducers */

const { LOGIN, LOGOUT } = require('./actions');

function userinfo(state = [], action) {
  switch (action.type) {
    case LOGIN:
      return Object.assign({}, state, {
        ...state,
        loggedIn: true,
        token: action.token,
        user: action.user,
        name: action.name
      });
    case LOGOUT:
      return Object.assign({}, state, {
        ...state,
        loggedIn: false,
        token: null,
        user: null,
        name: null
      });
    default:
      return state;
  }
}

module.exports = userinfo
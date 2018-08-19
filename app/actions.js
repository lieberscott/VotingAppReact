/* actions */

module.exports = {
  
  LOGIN: 'LOGIN',
  
  LOGOUT: 'LOGOUT',
  
  login: function(token, user) {
    return {
      type: this.LOGIN,
      token: token,
      user: user
    }
  },
  
  logout: function() {
    return {
      type: this.LOGOUT
    }
  }
  
}

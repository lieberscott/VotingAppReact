/* actions */

module.exports = {
  
  LOGIN: 'LOGIN',
  
  LOGOUT: 'LOGOUT',
  
  login: function(token, user, name) {
    return {
      type: this.LOGIN,
      token: token,
      user: user,
      name: name
    }
  },
  
  logout: function() {
    return {
      type: this.LOGOUT
    }
  }
  
}

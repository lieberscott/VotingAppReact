const React = require('react');
import { Collapse, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavbarBrand,
        NavbarToggler, NavItem, NavLink, UncontrolledDropdown, } from 'reactstrap';
import TwitterLogin from 'react-twitter-auth';

class Top extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
    this.onSuccess = this.onSuccess.bind(this);
    this.onFail = this.onFail.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  onSuccess(res) {
    const token = res.headers.get('x-auth-token');
    res.json().then((user) => { // user :  { id: '81957315', name: 'Scott Lieber' }
      console.log(user);
      if (token) {
        localStorage.setItem('poll-login', JSON.stringify({ name: user.name, token: token, twitter_id: user.id })); // localStorage can only be set as a string, so we use JSON.stringify
        this.setState({
          loggedIn: true,
          name: user.name,
          token: token,
          twitter_id: user.id
        });
      }
    });
  };
  
  onFail(err) {
    console.log(err);
    alert("Unable to log in user");
  };
  
  logout() {
    localStorage.removeItem('poll-login');
    this.setState({
      loggedIn: false,
      name: "",
      token: "",
      twitter_id: ""
    });
  };
  
  componentDidMount() {
    console.log("comp did mount");
    this.setState({
      loggedIn: this.props.loggedIn,
      name: this.props.name,
      token: this.props.token
    });
  }
  
  // componentDidUpdate() {
  //   console.log(this.props.loggedIn);
  //   console.log("comp did update");
  // }
  
  
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">reactstrap</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/newpoll/">New Poll</NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={ this.props.changeLocal }>New Poll</NavLink>
              </NavItem>
              <NavItem>
                { this.state.loggedIn ? <NavLink href="/mypolls">My Polls</NavLink> :
                <TwitterLogin
                  loginUrl="https://right-recorder.glitch.me/auth/twitter"
                  onFailure={ this.onFail }
                  onSuccess={ this.onSuccess }
                  requestTokenUrl="https://right-recorder.glitch.me/auth/twitter/reverse"
                  className="btn-twitter" /> }
              </NavItem>
              { this.state.loggedIn ?
                <NavItem>
                  <NavLink href="/logout/" onClick={ this.logout }>Logout</NavLink>
                </NavItem> : ""
               }
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

module.exports = Top;
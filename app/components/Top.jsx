const React = require('react');
const Collapse = require('reactstrap').Collapse;
const DropdownItem = require('reactstrap').DropdownItem;
const DropdownMenu = require('reactstrap').DropdownMenu;
const DropdownToggle = require('reactstrap').DropdownToggle;
const Nav = require('reactstrap').Nav;
const Navbar = require('reactstrap').Navbar;
const NavbarBrand = require('reactstrap').NavbarBrand;
const NavbarToggler = require('reactstrap').NavbarToggler;
const NavItem = require('reactstrap').NavItem;
const NavLink = require('reactstrap').NavLink;
const UncontrolledDropdown = require('reactstrap').UncontrolledDropdown;
const Link = require('react-router-dom').Link;
// const TwitterLogin = require('react-twitter-auth');
// import { Collapse, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavbarBrand,
//         NavbarToggler, NavItem, NavLink, UncontrolledDropdown, } from 'reactstrap';
import TwitterLogin from 'react-twitter-auth';


export class Top extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      loggedIn: false,
      isOpen: false
    };
    this.onSuccess = this.onSuccess.bind(this);
    this.onFail = this.onFail.bind(this);
    // this.logout = this.logout.bind(this);
    this.fakeLogout = this.fakeLogout.bind(this);
    this.fakeLogin = this.fakeLogin.bind(this);
  }
  
  fakeLogin() {
    // setTimeout(this.props.login, 100);
    this.props.login();
  }
  
  fakeLogout() {
    this.props.logout();
  }
  
  onSuccess(res) {
    const token = res.headers.get('x-auth-token');
    res.json().then((user) => { // user :  { id: '81957315', name: 'Scott Lieber' }
      if (token) {
        localStorage.setItem('poll-login', JSON.stringify({ name: user.name, token: token, twitter_id: user.id })); // localStorage can only be set as a string, so we use JSON.stringify
        this.setState({
          loggedIn: true,
          name: user.name,
          token: token,
          twitter_id: user.id
        });
        this.props.login(token, user.id);
      }
    });
  };
  
  onFail(err) {
    console.log(err);
    alert("Unable to log in user");
  };
  
  // logout() {
  //   localStorage.removeItem('poll-login');
  //   fetch('/logout');
  //   this.setState({
  //     loggedIn: false,
  //     name: "",
  //     token: "",
  //     twitter_id: ""
  //   });
  // };
  
  componentDidMount() {
    this.setState({
      loggedIn: this.props.loggedIn,
      name: this.props.name,
      token: this.props.token
    });
  }
  
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="#"><Link to="/">reactstrap</Link></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              { this.props.loggedIn ?
                <NavItem><NavLink href="#"><Link to="/newpoll">New Poll</Link></NavLink></NavItem> :
                "" }
              <NavItem>
                {/* this.props.loggedIn ? <NavLink onClick={ this.fakeLogout } href="#">Log Out</NavLink> :
                <NavLink onClick={ this.fakeLogin } href="#">Log In</NavLink> */}
                { this.props.loggedIn ?
                  <NavLink onClick={ this.fakeLogout } href="#">Log out</NavLink> :
                  <TwitterLogin
                  loginUrl="https://delirious-stem.glitch.me/auth/twitter"
                  onFailure={ this.onFail }
                  onSuccess={ this.onSuccess }
                  requestTokenUrl="https://delirious-stem.glitch.me/auth/twitter/reverse"
                  className="btn-twitter" /> }
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

export default Top;
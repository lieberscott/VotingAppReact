const React = require('react');
const Button = require('reactstrap').Button;
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
      isOpen: false
    };
    this.onSuccess = this.onSuccess.bind(this);
    this.onFail = this.onFail.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  logout() {
    this.props.logout();
  };
  
  onSuccess(res) {
    const token = res.headers.get('x-auth-token');
    res.json().then((user) => { // user :  { id: '81957315', displayName: 'Scott Lieber', user: 'smlieber84' }
      if (token) {
        this.props.login(token, user.id, user.displayName);
      }
    });
  };
  
  onFail(err) {
    console.log(err);
    alert("Unable to log in user");
  };
  
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="#"><Link to="/" className="link">Voting Machine</Link></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem><NavLink href="#"><Link to="/" className="link">Home</Link></NavLink></NavItem> 
              { this.props.loggedIn ?
                <NavItem><NavLink href="#"><Link to="/newpoll" className="link">New Poll</Link></NavLink></NavItem> :
                "" }
              <NavItem>
                { this.props.loggedIn ?
                  <UncontrolledDropdown nav inNavbar><DropdownToggle nav caret>{ this.props.name }</DropdownToggle>
                  <DropdownMenu right>
                  <DropdownItem><Link to="/mypolls" className="link">My polls</Link></DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem><Button color="primary" className="logoutbutton" onClick={ this.logout }>Sign Out</Button></DropdownItem>
                  </DropdownMenu></UncontrolledDropdown> :
                  <TwitterLogin
                  loginUrl="https://voting-machine.glitch.me/auth/twitter"
                  onFailure={ this.onFail }
                  onSuccess={ this.onSuccess }
                  requestTokenUrl="https://voting-machine.glitch.me/auth/twitter/reverse"
                  showIcon={ false }
                  className="btn btn-primary" /> }
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

export default Top;
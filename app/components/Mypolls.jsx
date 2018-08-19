const React = require('react');
const Link = require('react-router-dom').Link
const TopContainer = require('../containers/TopContainer');

/* the main page for the index route of this app */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pollData: []
    }
  }
  
  componentDidMount() {
    let url = '/mypolls/' + this.props.user;
    fetch(url)
    .then((res) => res.json())
    .then((json) => {
      this.setState({
        pollData: json.polls
      });
    });
  }
  
  render() {
    
    let data = this.state.pollData;
    
    return (
      <div>
        <TopContainer />
        <div className="display">
          <div className="row text-center align-center">
            <div className="col-lg-3">
              <img src="https://cdn.glitch.com/2536a81f-4520-419e-8562-c2e58ed463ef%2Fonlinevoting.png?1534702366851"/>
            </div>
            <div className="col-lg-9">
              <span className="headline">Welcome to the Voting Machine</span>
              <span className="subhead">Here are all your polls</span>
            </div>
          </div>
          <table className="table" id="polltable">
            <tbody>
              { data.map((val, ind) => {
                return (
                  <tr>
                  <td className="data" colSpan="8">
                    <Link to={ "/polls/" + val._id }>{ val.title }</Link>
                  </td>
                  <td class="numvotes" colSpan="4">
                    { val.answers.reduce((acc, cur) => { return acc + cur.votes}, 0) + " votes" } 
                  </td>
                </tr>
                )
              }) }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

module.exports = App;
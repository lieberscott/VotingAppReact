const React = require('react');
const Link = require('react-router-dom').Link
const TopContainer = require('../containers/TopContainer');
const ChartContainer = require('../containers/ChartContainer');


/* the main page for the index route of this app */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pollData: []
    }
  }
  
  componentDidMount() {
    let url = '/getpolls';
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
        <h1>Hello World!</h1>

        <Link to='/about'>Learn about this app!</Link>
        
        <table className="table" id="polltable">
          <tbody>
            Body
            { data.map((val, ind) => {
              return (
                <tr>
                <td className="data">
                  <Link to={ "/polls/" + val._id }>{ val.title }</Link>
                </td>
              </tr>
              )
            }) }
          </tbody>
        </table>

      </div>
    );
  }
}

module.exports = App;
const React = require('react');
const Link = require('react-router-dom').Link
const Top = require('./Top');


/* the main page for the index route of this app */
class HelloWorld extends React.Component {
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
        <h1>Hello World!</h1>

        <Link to='/about'>Learn about this app!</Link>
        
        <table className="table" id="polltable">
          <tbody>
            Body
            { data.map((val, ind) => {
              return (
                <tr>
                <td className="data">
                  <a href={ "/polls/" + val._id }>{ val.title }</a>
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

module.exports = HelloWorld;
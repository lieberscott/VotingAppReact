const React = require('react');
const Link = require('react-router-dom').Link;
const TopContainer = require('../containers/TopContainer');

class Newpoll extends React.Component {
  constructor(props) {
    super();
    this.state = {
      answers: [],
      title: "",
      redirect: false
    }
    this.handleTitle = this.handleTitle.bind(this);
    this.handleAnswers = this.handleAnswers.bind(this);
  }
  
  handleTitle(e) {
    this.setState({ title: e.target.value });
  }
  
  handleAnswers(e) {
    let regex = /\r\n?|\n/g; // \r, \r\n, or \n (line break varies based on operating system)
    let string = e.target.value;
    let answers = string.split(regex); // ["Boston Celtics", "Chicago Bulls", ... ]
    this.setState({ answers });
  }
  
  createPoll(e) {
    e.preventDefault();
    let title = this.state.title;
    let ans = this.state.answers;
    
    if (this.props.token) {
      const myHeaders = new Headers();
      myHeaders.append('authorization', this.props.token);
      myHeaders.append('title', title);
      myHeaders.append('answers', ans);
      fetch("/createpoll", { method: "POST", headers: myHeaders })
      .then((res) => res.json())
      .then((json) => {
        if (json.result == "success") {
          this.setState({ redirect: true });
          alert("Your poll was added");
        }
        else { alert("We could not verify you as a registered user. Please try again.") }
      })
    }
    else { alert("Please log in") }
  }
  
  render() {
    if (this.state.redirect) {
      return <Redirect to="/" />
    }
    
    return (
      <div>
        <TopContainer />
        <div className="display">
          <header>
            <h1>Make a new poll!</h1>
          </header>
          <main>
            <form id="newpoll">
              <div className="form-group">
                <label for="title">Title</label>
                <input className="form-control" id="title" type="text" name="title" placeholder="Title" onChange={ this.handleTitle }/>
              </div>
              <div className="form-group">
                <label for="answers">List answers (separated by new line)</label>
                <textarea className="form-control" id="answers" type="text" name="answers" rows="5" onChange={ this.handleAnswers }/>
              </div>
              <button className="btn btn-primary" type="submit" onClick={ (e) => this.createPoll(e) }>Submit</button>
            </form>
          </main>
        </div>
      </div>
    );
  }
}

module.exports = Newpoll;
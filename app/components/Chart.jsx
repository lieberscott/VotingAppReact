const React = require('react');
const Pie = require('react-chartjs-2').Pie;
const Button = require('reactstrap').Button;
const Form = require('reactstrap').Form;
const FormGroup = require('reactstrap').FormGroup;
const Label = require('reactstrap').Label;
const Input = require('reactstrap').Input;
const FormText = require('reactstrap').FormText;
const TopContainer = require('../containers/TopContainer');
import { Redirect } from 'react-router-dom';

// import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: []
        }]
      },
      createdBy: null, // if matches current user, delete button will appear for user
      title: "",
      answeredIPs: [],
      answeredUsers: [],
      answers: [], // ["Boston Celtics", "Chicago Bulls", ... ]
      votes: [], // [10, 12, ... ]
      ip: "",
      selection: "", // text from custom answer,
      user: null, // Twitter login number
      token: this.props.token,
      custom: false,
      redirect: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  componentDidMount() {
    fetch("/findpoll/" + this.props.match.params.pollnumber)
    .then((res) => res.json())
    .then((json) => {
      let data = json.poll[0].answers;
      let answers = [];
      let votes = [];
      for (let i = 0; i < data.length; i++) {
        answers.push(data[i].option);
        votes.push(data[i].votes);
      }
      this.setState({
        chartData: {
          labels: answers,
          datasets: [{
            data: votes,
            backgroundColor: ["#224560", "#4a143e", "#4b7d64", "#676301", "#a53e0c", "#bbc85c", "#4f7531", "#a07722", "#ae2d2e", "#f322b0", "#a9a99e"],
            hoverBackgroundColor: ["#264e6d", "#571849", "#51886c", "#787301", "#b5440d", "#c0cc69", "#578136", "#ae8125", "#bb3032", "#f432b6", "#b1b1a7"]
          }]
        },
        created_by: json.poll[0].createdBy,
        title: json.poll[0].title,
        answeredIPs: json.poll[0].answeredIPs,
        answeredUsers: json.poll[0].answeredUsers,
        answers: answers,
        votes: votes,
        redirect: false
      });
    });
    
    fetch("/getip")
    .then((res) => res.json())
    .then((json) => {
      this.setState({ ip: json.ip });
    });
  }
  
  handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    let answer = data.get('custom') || data.get('select');
    console.log(this.state.ip);
    console.log(this.props.user);
    // if (this.state.answeredIPs.includes(this.state.ip) || this.state.answeredUsers.includes(this.props.user)) {
    if (false) {
      alert("You have already voted from this IP address or user account");
    }
    else {
      const myHeaders = new Headers();
      myHeaders.append('authorization', this.props.token);
      myHeaders.append('answer', answer);
      fetch("/answer", { method: "POST", headers: myHeaders})
      .then((res) => res.json())
      .then((json) => {
        if (json.result == "success") {
          alert("Your vote has been tallied!");
          this.setState({ redirect: true });
        }
        else {
          alert("There was an error with your submission. Please try again.");
        }
      })
    }
  }
  
  change(e) {
    if (e.target.value == "I'd like a custom answer") {
      this.setState({ custom: true });
    }
    else { this.setState({ custom: false }) }
  }

  render() {
    
    if (this.state.redirect) {
      return <Redirect to={ "/" } />;
    }
    
    return (
      <div>
        <TopContainer />
        <div className="display">
          <div className="row">
            <div className="col-lg-5">
              <p>{ this.state.title }</p>
              <Form id="answer" onSubmit={ this.handleSubmit } className="width">
                <FormGroup>
                <Label for="select">Select</Label>
                  <Input type="select" name="select" id="select" onClick={ this.handleClick } onChange={(e) => this.change(e) }>
                    <option>Select</option>
                    { this.state.chartData.labels.map((item, ind) => {
                      return ( <option>{ item }</option> );
                    })}
                    { this.props.loggedIn ? <option>I'd like a custom answer</option> : "" }
                  </Input>
                  { this.props.loggedIn ? "" : <span>Or sign in to choose a custom option</span> }
                  { this.state.custom && this.props.loggedIn ? <Input placeholder="Your answer" name="custom"></Input> : "" }
                </FormGroup>
                <Button outline color="success" type="submit" className="buttonwidth">Submit</Button>
                <a target="_blank" href={"https://twitter.com/intent/tweet?&text=" + this.state.title + "&url=https://voting-machine.glitch.me/" + this.props.match.params.pollnumber }>
                  <Button onClick={ this.tweet } color="primary" className="buttonwidth">Share on Twitter</Button>
                </a>
              </Form>
            </div>
            <div className="col-lg-7">
              <div className="canvas text-center">
                <Pie
                  data={ this.state.chartData }
                  options={{
                    animation: { animateScale: true },
                    cutoutPercentage: 50,
                    maintainAspectRatio: false,
                    responsive: true,
                    tooltips: {
                      callbacks: {
                        label: (tooltipItem, data) => {
                          // let label = "hello";
                          let label = this.state.answers[tooltipItem.index] + ": " + this.state.votes[tooltipItem.index];
                          return label;
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Chart;
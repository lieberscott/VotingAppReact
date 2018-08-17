const React = require('react');
import { Pie } from 'react-chartjs-2';
const Top = require('./Top');
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

class Chart extends React.Component {
  constructor(props) {
    super(props);    
    console.log("chart constructor");
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
      token: true,
      custom: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  componentDidMount() {
    console.log("chart mount");
    
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

      console.log(json)
      this.setState({
        chartData: {
          labels: answers,
          datasets: [{
            data: votes,
            backgroundColor: ["#224560", "#4a143e", "#4b7d64", "#676301", "#a53e0c", "#bbc85c", "#4f7531", "#a07722", "#ae2d2e", "#f322b0", "#a9a99e"],
            hoverBackgroundColor: ["#264e6d", "#571849", "#51886c", "#787301", "#b5440d", "#c0cc69", "#578136", "#ae8125", "#bb3032", "#f432b6", "#b1b1a7"]
          }]
        },
        created_by: json.poll[0].created_by,
        title: json.poll[0].title,
        answeredIPs: json.poll[0].answeredIPs,
        answeredUsers: json.poll[0].answeredUsers,
        answers: answers,
        votes: votes
      });
    });
    
    fetch("/getip")
    .then((res) => res.json())
    .then((json) => {
      console.log(json.ip);
      this.setState({ ip: json.ip });
    });
    
  }
  
  componentDidUpdate() {
    console.log("chart update");
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    const data = new FormData(e.target);
    let answer = data.get('custom') || data.get('select');
    // let custom = data.get('custom');
    console.log(answer);
    // console.log(custom);
    
    const myHeaders = new Headers();
    let local = localStorage.getItem('poll-login');
    if (local) {
      let data = JSON.parse(local);
      let token = data.token;
      let user = data.user;
      myHeaders.append('authorization', 'Bearer ' + token);
      // if (answer) {
      //   fetch("/answer?&data=
      // }
    }
    
    if (this.state.answeredIPs.includes(this.state.ip)) {
      alert("You have already voted from this IP address or user account");
    }
    
//     else {

//       const data = new FormData(e.target); // answer from form
//       fetch("/answer", { method: "POST", headers: myHeaders })
//       .then((res) => res.json())
//       .then((json) => {
//         // do something
//       });
//     }
  }
  
  change(e) {
    console.log(e.target.value);
    if (e.target.value == "I'd like a custom answer") {
      this.setState({ custom: true });
    }
    else { this.setState({ custom: false }) }
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-5">
          <p>{ this.state.title }</p>
        <Form id="answer" onSubmit={ this.handleSubmit }>
          <FormGroup>
          <Label for="select">Select</Label>
            <Input type="select" name="select" id="select" onChange={(e) => this.change(e) }>
              <option>Select</option>
              { this.state.chartData.labels.map((item, ind) => {
                return ( <option>{ item }</option> );
              })}
              { this.state.token ? <option>I'd like a custom answer</option> : "" }
            </Input>
            { this.state.token ? "" : <span>Or sign in to choose a custom option</span> }
            { this.state.custom ? <Input placeholder="Your answer" name="custom"></Input> : "" }
          </FormGroup>
          <Button type="submit">Submit</Button>
        </Form>
        </div>
        <div className="canvas">
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
    );
  }
}

module.exports = Chart;
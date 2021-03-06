import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Levels from './Levels.jsx';
import PledgeBox from './PledgeBox.jsx';

class Support extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // limited: backer number is close to the maxbacker number
      // all levels: all levels including limited
      // current: excluding limit
      // full: number of backer reached to the max
      allCurrentLevels: [],
      currentLevels: [],
      limitedLevels: [],
      fullLevels: [],
    };
    this.fetchLevels = this.fetchLevels.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.fetchLevels();
  }

  fetchLevels() {
    const url = (process.env.NODE_ENV === 'production') ? 'http://SDC-Quickstarter-141756345.us-west-1.elb.amazonaws.com' : 'http://localhost:7777';

    axios.get(`${url}/levels/${this.props.projectId}`)
      .then((results) => {
        console.log('Data received:', results.data);
        const levels = results.data;
        const updatedAllCurrentLevels = [];
        const updatedCurrentLevels = [];
        const updatedLimitedLevels = [];
        const updatedFullLevels = [];
        for (let i = 0; i < levels.length; i++) {
          if (levels[i].numberofbackers === levels[i].maxbackers) {
            updatedFullLevels.push(levels[i]);
          } else if (levels[i].numberofbackers / levels[i].maxbackers > 0.90) {
            updatedAllCurrentLevels.push(levels[i]);
            updatedLimitedLevels.push(levels[i]);
          } else {
            updatedAllCurrentLevels.push(levels[i]);
            updatedCurrentLevels.push(levels[i]);
          }
        }
        this.setState({
          allCurrentLevels: updatedAllCurrentLevels, currentLevels: updatedCurrentLevels, limitedLevels: updatedLimitedLevels, fullLevels: updatedFullLevels,
        });
      })
      .catch((err) => {
        console.log('ERROR IN SUPPORT COMPONENT', err);
        console.log(err);
      });
  }

  render() {
    return (
      <div id="support-master-container">
        <div id="support-container">
          <h1 id="support-header" className="section-header">Support</h1>
          <div id="support-components-container">
            <PledgeBox projectId={this.props.projectId} userId={this.props.userId} />
            <Levels userId={this.props.userId} fetchLevels={this.fetchLevels} allCurrentLevels={this.state.allCurrentLevels} currentLevels={this.state.currentLevels} limitedLevels={this.state.limitedLevels} fullLevels={this.state.fullLevels} />
          </div>
        </div>
      </div>
    );
  }
}

export default Support;

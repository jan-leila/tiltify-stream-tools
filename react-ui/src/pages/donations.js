import React, { Component } from 'react';

import DonationRange from './../components/donationRange';

class Page extends Component {

  constructor(props){
    super(props);

    this.state = {
      settings: {
        chat: true,
        chatTotal: true,
        chatName: true,
        chatComment: true,
        stream: true,
        playSound: true,
        streamTotal: true,
        streamName: true,
        streamComment: true
      },
      ranges: []
    }

    fetch('/ranges')
    .then((res) => {
      return res.json();
    })
    .then((ranges) => {
      this.setState({
        ranges: ranges
      });
    });

    fetch('donations')
    .then((res) => {
      return res.json();
    })
    .then((settings) => {
      this.setState({
        settings: settings
      });
    })
  }

  updateSettings(e){
    let name = e.target.name;
    let settings = this.state.settings;
    settings[name] = !settings[name];
    fetch('donations', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    this.setState({
      settings: settings
    });
  }

  render(){
    return <div>
      <h2>Donations</h2>

      <input type='checkbox' checked={this.state.settings.chat} name='chat' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations in chat</span><br/>
      <input type='checkbox' checked={this.state.settings.chatTotal} name='chatTotal' onChange={(e) => {this.updateSettings(e)}}/><span>Show donation total in chat</span><br/>
      <input type='checkbox' checked={this.state.settings.chatName} name='chatName' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations name in chat</span><br/>
      <input type='checkbox' checked={this.state.settings.chatComment} name='chatComment' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations comment in chat</span><br/>
      <br/>
      <input type='checkbox' checked={this.state.settings.stream} name='stream' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations on stream</span><br/>
      <input type='checkbox' checked={this.state.settings.playSound} name='playSound' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations on stream</span><br/>
      <input type='checkbox' checked={this.state.settings.streamTotal} name='streamTotal' onChange={(e) => {this.updateSettings(e)}}/><span>Show donation total on stream</span><br/>
      <input type='checkbox' checked={this.state.settings.streamName} name='streamName' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations name on stream</span><br/>
      <input type='checkbox' checked={this.state.settings.streamComment} name='streamComment' onChange={(e) => {this.updateSettings(e)}}/><span>Show donations comment on stream</span><br/>
      <br/>

      {
        this.state.ranges.map((range, i) => {
          return <DonationRange key={i} id={range.id} min={range.min} max={range.max} images={range.images} sounds={range.sounds} delete={() => {
            let ranges = [...this.state.ranges];
            ranges = ranges.filter((r) => {
              return r.id !== range.id;
            });
            this.setState({
              ranges: ranges
            })
          }}/>
        })
      }
      <button onClick={() => {
        fetch('/range', {
          method: 'post',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          return res.text();
        })
        .then((id) => {
          fetch(`/range/${id}`)
          .then((res) => {
            return res.json();
          })
          .then((json) => {
            let ranges = [...this.state.ranges];
            ranges.push(json);
            this.setState({
              ranges: ranges
            })
          });
        });
      }}>Add donation range</button>
    </div>;
  }
}

export default Page;

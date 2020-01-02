import React, { Component } from 'react';

class Home extends Component {
  constructor(props){
    super(props);

    this.state = {
      obsPassword: '',
      tiltifyToken: '',
      twitchUsername: '',
      twitchOAuth: '',
      twitchChannel: ''
    }

    fetch('auth')
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log(json);
      this.setState(json);
    });
  }

  render(){
    return <div>
      <h2>Settings</h2>

      <h4>OBS</h4>
      <div>
        <div>
          obs-websocket password: <input type="password" value={this.state.obsPassword} onChange={(e) => {
            let value = e.target.value;
            fetch('/obsPassword', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                password: value
              })
            })
            .then((res) => {
              this.setState({
                obsPassword: value
              })
            });
          }}/>
          <span style={{
            margin: '3px',
            color: '#aaa',
            fontSize: '12px'
          }}>obs > tools > Websocket Server Settings</span>
        </div>
        <div>
          obs address: <input value={this.state.obsAddress} onChange={(e) => {
            let value = e.target.value;
            fetch('/obsAddress', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                address: value
              })
            })
            .then((res) => {
              this.setState({
                obsAddress: value
              })
            });
          }}/>
        </div>
      </div>
      <h4>Tiltify</h4>
      <div>
        Tiltify api Token:
        <input type="password" value={this.state.tiltifyToken} onChange={(e) => {
          let value = e.target.value;
          fetch('/tiltifyToken', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: value
            })
          })
          .then((res) => {
            this.setState({
              obsPassword: value
            })
          });
        }}/>
        <a tabIndex="-1" style={{
          margin: '3px',
          color: '#aaa',
          textDecoration: 'none',
          fontSize: '12px'
        }} href='https://tiltify.com/@me/dashboard/account/apps/create'>https://tiltify.com/@me/dashboard/account/apps/create</a>
      </div>
      <h4>Twitch</h4>
      <div>
        <div>Twitch Username: <input value={this.state.twitchUsername} onChange={(e) => {
          let value = e.target.value;
          fetch('/twitchUsername', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: value
            })
          })
          .then((res) => {
            this.setState({
              username: value
            })
          });
        }}/></div>
        <div>
          Twitch OAuth Token:
          <input type="password" value={this.state.twitchOAuth} onChange={(e) => {
            let value = e.target.value;
            fetch('/twitchOAuth', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                token: value
              })
            })
            .then((res) => {
              this.setState({
                obsPassword: value
              })
            });
          }}/>
          <a tabIndex="-1" style={{
            margin: '3px',
            color: '#aaa',
            textDecoration: 'none',
            fontSize: '12px'
          }} href='https://twitchapps.com/tmi/'>https://twitchapps.com/tmi/</a></div>
        <div>Twitch Channel: <input value={this.state.twitchChannel} onChange={(e) => {
          let value = e.target.value;
          fetch('/twitchChannel', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              channel: value
            })
          })
          .then((res) => {
            this.setState({
              obsPassword: value
            })
          });
        }}/></div>
      </div>
      <br/>
      <h3 style={{
        color: '#f00'
      }}>DANGER ZONE:</h3>
      <button style={{
        margin: '10px'
      }}>Shut down</button><br/>
      <button style={{
        margin: '10px'
      }}>Reset</button>
    </div>;
  }
}

export default Home;

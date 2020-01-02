import React, { Component } from 'react';

class Home extends Component {
  render(){
    return <div>
      <h2>Help</h2>

      <h4>Home</h4>
      <p>The home page will have something on it eventualy :)</p>

      <h4>Donation</h4>
      <p>The donations tab is for setting everything to do with donation notifications. The check boxes at the top of the screen can be used to set where notifications show up.</p>
      <p>At the bottom of the page you can set sound and icons for donation totals. (click the "Add donation range" button to add a new range) Click the buttons next to "Add Image" and "Add Sound" to add new images and sounds to ranges. A random sound an image will be picked to be shown/played when a matching donation is made.</p>
      <p>If more then one range matches the donation then one of the ranges will be picked to be used</p>

      <h4>Settings</h4>
      <p>The settings page is where you will set all of your keys. (Tiltify, Twitch, OBS)</p>

      <h4>Help</h4>
      <p>The help page has information on how all of the other pages work</p>
    </div>;
  }
}

export default Home;

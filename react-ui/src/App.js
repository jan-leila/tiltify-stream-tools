import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './App.css';

import HomePage from './pages/home';
import HelpPage from './pages/help';
import DonationPage from './pages/donations';
import SettingsPage from './pages/settings';

class AppWrapper extends Component {
  render(){
    return <Router>
      <div className='TopBar'>
        GFGC thing.
      </div>
      <div className='SideBar'>
        <Link to='/'>Home</Link><br/>
        <Link to='/donations'>Donations</Link><br/>
        <Link to='/settings'>Settings</Link><br/>
        <Link to='/help'>Help</Link>
      </div>
      <div className='Page'>
          <Route exact path='/' component={HomePage}/>
          <Route path='/help' component={HelpPage}/>
          <Route path='/donations' component={DonationPage}/>
          <Route path='/settings' component={SettingsPage}/>
      </div>
    </Router>;
  }
}

function App() {
  return (
    <AppWrapper/>
  );
}

export default App;

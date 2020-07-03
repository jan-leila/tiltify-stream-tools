import React from 'react';
import { Switch, Route } from 'react-router-dom';

import './index.scss';

import Donations from './pages/donations';
import Help from './pages/help';
import Home from './pages/home';
import Ranges from './pages/ranges';
import Sources from './pages/sources';

function Body(){
  return <div className='body'>
    <Switch>
      <Route path='/donations' render={() => <Donations/>}/>
      <Route path='/help' render={() => <Help/>}/>
      <Route path='/ranges' render={() => <Ranges/>}/>
      <Route path='/sources' render={() => <Sources/>}/>
      <Route path='/' render={() => <Home/>}/>
    </Switch>
  </div>;
}

export default Body;

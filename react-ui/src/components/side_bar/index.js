import React from 'react';
import { NavLink } from 'react-router-dom';

import './index.scss';

function SideBar(){
  return <div className='side-bar'>
    <NavLink exact activeClassName={'active'} to='/'>Home</NavLink>
    <NavLink activeClassName={'active'} to='/sources'>Sources</NavLink>
    <NavLink activeClassName={'active'} to='/ranges'>Ranges</NavLink>
    <NavLink activeClassName={'active'} to='/donations'>Donations</NavLink>
    <NavLink activeClassName={'active'} to='/help'>Help</NavLink>
  </div>;
}

export default SideBar;

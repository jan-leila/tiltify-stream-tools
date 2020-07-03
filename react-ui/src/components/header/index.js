import React from 'react';
import { Link } from 'react-router-dom';

import './index.scss';
import GFGC_Logo from './gfgc-270px.png';

function Header(){
  return <div className='header'>
    <Link to='/' className='title'>GFGC stream tools</Link>
    <Link to='/' className='logo'><img className='logo' alt='gfgc logo' src={GFGC_Logo}/></Link>
  </div>;
}

export default Header;

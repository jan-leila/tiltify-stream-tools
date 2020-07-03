import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import './App.scss';

import Header from './components/header';
import SideBar from './components/side_bar';
import Body from './components/body';

// class AppWrapper extends Component {
//   render(){
//     return <Router>
//       <div className='TopBar'>
//         GFGC thing.
//       </div>
//       <div className='SideBar'>
//         <Link to='/'>Home</Link><br/>
//         <Link to='/donations'>Donations</Link><br/>
//         <Link to='/settings'>Settings</Link><br/>
//         <Link to='/help'>Help</Link>
//       </div>
//       <div className='Page'>
//           <Route exact path='/' component={HomePage}/>
//           <Route path='/help' component={HelpPage}/>
//           <Route path='/donations' component={DonationPage}/>
//           <Route path='/settings' component={SettingsPage}/>
//       </div>
//     </Router>;
//   }
// }

function App() {
  return <Router>
    <Header/>
    <div className="page-content">
      <SideBar/>
      <Body/>
    </div>
  </Router>
}

export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

import './App.scss';

import Header from './components/header';
import SideBar from './components/side_bar';
import Body from './components/body';

const apollo_client = new ApolloClient({
  uri: '/api/v1',
});

function App() {
  return (
    <ApolloProvider client={apollo_client}>
      <Router>
        <Header/>
        <div className="page-content">
          <SideBar/>
          <Body/>
        </div>
      </Router>
    </ApolloProvider>
  )
}

export default App;

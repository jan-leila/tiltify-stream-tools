import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import './index.scss';

const GET_SOURCES = gql`
  {
    get_sources {
      name
      id
    }
  }
`

function Sources(){
  const { loading, error, data } = useQuery(GET_SOURCES);
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  console.log(data);
  return <></>;
}

function Page(){

  return <>
    <div className='title'>Sources</div>
    <Sources/>
  </>;
}

export default Page;

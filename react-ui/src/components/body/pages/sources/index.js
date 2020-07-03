import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';

import './index.scss';

const GET_SOURCES = gql`
  {
    get_sources {
      name
      id
      length
    }
  }
`;

const UPDATE_SOUCRE = gql`
  mutation($id: Int!, $length: Int!){
    update_source(id: $id, length: $length){
      id
    }
  }
`;

const PLAY_SOURCE = gql`
  mutation($id: Int!){
    play_source(id: $id){
      id
    }
  }
`;

function Source({ name, id, length: _length }){
  let [ oldLength, setOldLength ] = useState(_length);
  let [ length, setLength ] = useState(_length);
  if(oldLength !== _length){
    setOldLength(_length);
    setLength(_length);
  }
  const [ updateSource ] = useMutation(UPDATE_SOUCRE);
  const [ playSource ] = useMutation(PLAY_SOURCE);

  return <div title={`id: ${id}`} className='source' onClick={(e) => {
      e.preventDefault();
      playSource({ variables: { id }})
    }}>
    <div className='name'>{name}</div>
    <div className='length'>
      <label>length:</label>
      <input type='number' value={length} onChange={(e) => {
        e.preventDefault();
        let length = parseInt(e.target.value);
        setLength(length);
        updateSource({ variables: { id, length }})
      }}></input>
    </div>
  </div>;
}

function Sources(){
  const { loading, error, data } = useQuery(GET_SOURCES, {
    pollInterval: 500,
  });
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  let { get_sources: sources } = data;
  return <div className='sources'>
  {
    sources.map((source, i) => {
      return <Source key={i} { ...source }/>;
    })
  }
</div>;
}

function Page(){

  return <>
    <div className='title'>Sources:</div>
    <Sources/>
  </>;
}

export default Page;

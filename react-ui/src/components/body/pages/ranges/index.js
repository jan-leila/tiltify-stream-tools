import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';

import './index.scss';

import useSoftState from './../../../../hooks/useSoftState'

const GET_SOURCES = gql`
  {
    get_sources {
      name
      id
    }
  }
`;

const GET_RANGES = gql`
  {
    get_ranges {
      id
      min
      max
      weight
      sources {
        id
        name
      }
    }
  }
`;

const DELETE_RANGE = gql`
  mutation($id: String!){
    delete_range(id: $id){
      id
    }
  }
`

const CREATE_RANGE = gql`
  mutation{
  create_range {
    id
  }
  }
`

const UPDATE_RANGE = gql`
  mutation($id: String!, $weight: Float, $min: Float, $max: Float, $sources: [Int]){
    update_range(id: $id, weight: $weight, min: $min, max: $max, sources: $sources){
      id
    }
  }
`

const PLAY_RANGE = gql`
  mutation($id: Int!){
    play_range(id: $id){
      id
    }
  }
`

function Number({id, name, val: _val} ){
  const [ updateRange ] = useMutation(UPDATE_RANGE);
  const [ val, setVal ] = useSoftState(_val);
  return <div>
    <label>{name}:</label>
    <input type='number' value={val} onChange={(e) => {
      e.preventDefault();
      let { target: { value } } = e;
      setVal(value);
      let variables = { id };
      variables[name] = parseFloat(value);
      updateRange({ variables });
    }}></input>
  </div>;
}

function SourceSelector({ value, set, remove }){
  const { loading, error, data } = useQuery(GET_SOURCES, {
    pollInterval: 500,
  });
  return <div>
    <select onChange={(e) => {
        set(parseInt(e.target.value));
      }}>
      {
        (loading)?
        'Loading...'
        :
        (error)?
        'Error!'
        :
        data.get_sources.map(({ id, name }, i) => {
          return <option key={i} value={id}>{name}</option>
        })
      }
    </select>
    <button onClick={remove}>remove source</button>
  </div>
}

function Range({ id, min, max, weight, sources: _sources }){
  const [ sources, setSources ] = useSoftState(_sources);
  const [ updateRange ] = useMutation(UPDATE_RANGE);
  const [ delete_range ] = useMutation(DELETE_RANGE);

  return <div className='range'>
    <div className='id'>{id}</div>
    <Number id={id} name='min' val={min}/>
    <Number id={id} name='max' val={max}/>
    <Number id={id} name='weight' val={weight}/>
    <div className='sources'>
      {
        sources.map((source, i) => {
          return <SourceSelector key={i} value={source} set={(value) => {
              let newSources = sources.map((source, j) => {
                if(i === j){
                  return value;
                }
                return source.id;
              })
              setSources(newSources);
              updateRange({ variables: { id, sources: newSources } });
            console.log(value, i);
          }} remove={() => {
            let newSources = sources.filter((source, j) => {
              return i !== j;
            });
            setSources(newSources);
            updateRange({ variables: { id, sources: newSources } });
          }}/>;
        })
      }
      <button onClick={() => {
        let newSources = [...sources, -1];
        setSources(newSources);
        updateRange({ variables: { id, sources: newSources } });
      }}>add source</button>
    </div>
    <button onClick={() => {
        delete_range({ variables: { id } });
    }}>remove range</button>
  </div>;
}

function Ranges(){
  const { loading, error, data } = useQuery(GET_RANGES, {
    pollInterval: 500,
  });
  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  let { get_ranges: ranges } = data;
  return <div className='ranges'>
    {
      ranges.map((range, i) => {
        return <Range key={i} {...range}/>
      })
    }
  </div>;
}

function Page(){
  const [ create_range ] = useMutation(CREATE_RANGE);
  return <div className='ranges-page'>
    <div>Ranges</div>
    <Ranges/>
    <button onClick={() => {
        create_range();
    }}>add range</button>
  </div>;
}

export default Page;

import { useState } from 'react';

function useSoftState(def){
  const [ oldState, setOldState ] = useState(def);
  const [ state, setState ] = useState(def);
  if(def !== oldState){
    setOldState(def);
    setState(def);
  }
  return [ state, setState ];
}

export default useSoftState;

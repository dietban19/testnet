import ObituaryContainer from './ObituaryContainer'
import React from 'react';
const Obituary = ({ obituaries }) => {
    console.log(obituaries.length)
    return obituaries.length > 0 ? (
        <ul>
    {obituaries.map((item, index) => (
        <ObituaryContainer obituary={item} key={`node-item-${index}`} index={index} />
      ))}
      </ul>

) : (
    <p id="no-note-yet"></p>
  );
}


export default Obituary;
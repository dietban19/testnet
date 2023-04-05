import ObituaryContainer from './ObituaryContainer'
import React from 'react';



const Obituary = ({ obituaries }) => {
    return obituaries.length > 0 ? (
      <div className="obituary-list">
        {obituaries.map((item, index) => (

          <ObituaryContainer obituary={item} key={`node-item-${index}`} index={index} />
        ))}
      </div>
    ) : (

      <p id="no-note-yet"></p>

    );
  };
  

export default Obituary;
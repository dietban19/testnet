import NewDate from './NewDate';
import React, { useState } from 'react';
import { Image } from 'cloudinary-react';
function ObituaryContainer({ obituary, index }) {
  const [showDescription, setShowDescription] = useState(false);

  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  const handleButtonClick = (event) => {
    event.stopPropagation();
    console.log('Button clicked');
  };

  return (
    <div
      className="obi-item"
      key={`obi-item-${index}`}
      onClick={toggleDescription}
      style={{ height: showDescription ? 'auto' : 'initial' }}
    >
{/*       
      <img
        id="imagePic"
        src={obituary.image}
        alt={`Image of ${obituary.name}`}
        className="obi-image"
      ></img> */}
       <Image 
                    className = "obi-image"
                    cloudName = "dx0n3s9h4" 
                    publicId = {obituary.image}/>
      <div className="obi-header">
        <h2 id="obi-name">{obituary.name}</h2>

        <div className="obi-date">
          <NewDate date={obituary.birthDate} />-<NewDate id="obi-death" date={obituary.deathDate} />
        </div>
      </div>
      {showDescription && (
        <div className="obi-description">
          <div className="description-container">
            <p>{obituary.description}</p>
            <button id="play-button" onClick={handleButtonClick}>
              This is a button
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObituaryContainer;

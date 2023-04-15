import NewDate from './NewDate';
import React, { useState, useRef, useEffect } from 'react';

function ObituaryContainer({ obituary, index }) {
  const [showDescription, setShowDescription] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  useEffect(() => {
    // Fetch the audio file
    // ...

    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [isPlaying, obituary.audio]);

  const handleButtonClick = (event) => {
    event.stopPropagation();

    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
    } else {
      setIsPlaying(true);
      audioRef.current.play();
    }
  };

  return (
    <div
      className="obi-item"
      key={`obi-item-${index}`}
      onClick={toggleDescription}
      style={{ height: showDescription ? 'auto' : 'initial' }}
    >
      <img id="imagePic" src={obituary.image} alt={`Image of ${obituary.name}`}></img>
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
              {isPlaying ? 'Stop Audio' : 'Play Audio'}
            </button>
        
            <audio
              ref={audioRef}
              src={obituary.audio}
              type="audio/mpeg"
              onEnded={() => setIsPlaying(false)}
            ></audio>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObituaryContainer;

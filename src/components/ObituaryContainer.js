import NewDate from './NewDate'


function ObituaryContainer({ obituary, index }) {
    return (
      <li className="obi-item custom-obi-item" key={`obi-item-${index}`}>
        <img id="imagePic" src={obituary.image} alt={`Image of ${obituary.name}`}></img>
        <div className="obi-header">
          <h2 id="obi-name">{obituary.name}</h2>
          <div className="obi-date">
            <NewDate date={obituary.birthDate} />-<NewDate id="obi-death" date={obituary.deathDate} />
          </div>
          <details>
            <summary>Click</summary>
            Hello
          </details>
        </div>
      </li>
    );
  }
  
  
  export default ObituaryContainer;
  
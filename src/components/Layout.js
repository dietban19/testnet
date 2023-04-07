import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Obituary from "./Obituary";
import axios from 'axios';
import openai from 'openai';

//zvdudnw2
function Layout() {
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);


    // selectedFile is the image that was choosen by the user
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const [birthDateTime, setBirthDateTime] = useState('');
  const [deathDateTime, setDeathDateTime] = useState('');
  const [name, setName] = useState('');

  // want the details of the obituaries to be independent and unique, store in array
  const [obituaries, setObituaries] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [publicId, setPublicId] = useState('');



  useEffect(() => {
    if (obituaries.length <= 0) {
      navigate("/")
      return;
    }
    navigate("/obituaries");
  }, [obituaries, navigate]);

  

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {

    // Reset the form data
    setSelectedFile(null);
    setBirthDateTime(null);
    setDeathDateTime(null);

    setIsPopupOpen(false);
  };
  
  const generateTransformedImageUrl = (publicId, effect) => {
    const baseUrl = "https://res.cloudinary.com/dx0n3s9h4/image/upload";
    return `${baseUrl}/${effect}/${publicId}`;
  };
  
  const handleFileChange = (event) => {
    if (event.length > 0) {
      const myFormData = new FormData();
      myFormData.append("file", event[0]);
      myFormData.append("upload_preset", "zvdudnw2");
      myFormData.append("e_pixelate", "20"); // Add the effect as a FormData parameter
  
      axios
        .post("https://api.cloudinary.com/v1_1/dx0n3s9h4/image/upload", myFormData) // Remove the effect from the URL
        .then((response) => {
          console.log(response);
          setPublicId(response.data.public_id);
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
  
      setSelectedFile(URL.createObjectURL(event[0]));
      setSelectedFileName(event[0].name);
    } else {
      setSelectedFile(null);
      setSelectedFileName(null);
    }
  };
  

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleBirthDateTimeChange = (event) => {
    setBirthDateTime(event.target.value);
  };
  
  const handleDeathDateTimeChange = (event) => {
    setDeathDateTime(event.target.value);
  };

  const handleWriteObituary = () => {
    if (birthDateTime && deathDateTime) {
      // Apply the pixelation effect to the image URL
      const pixelatedImageUrl = generateTransformedImageUrl(publicId, "e_art:zorro");
  
      const newObituary = {
        id: uuidv4(),
        name: name,
        image: pixelatedImageUrl, // Use the transformed image URL
        birthDate: birthDateTime,
        deathDate: deathDateTime,
        description: "this is the description",
      };
  
      setObituaries([...obituaries, newObituary]);
  
      // Reset the form data
      setSelectedFile(null);
      setBirthDateTime(null);
      setDeathDateTime(null);
  
      // Close the popup
      closePopup();
    } else {
      alert("Please enter both birth and death date/time");
    }
  };
  
  
 
  return (
    <div id="container">
      <header>

        <aside>
          {/* <button id="menu-button" onClick={() => setCollapse(!collapse)}>
            &#9776;
          </button> */}
          &nbsp;
        </aside>

        <div id="top-header">
            <Link to="/notes">The Last Show</Link>
        </div>
        
        <aside>
          <button id = "add-button" onClick={openPopup}>+ Add Obituary</button>
        </aside>
      </header>
      <div>
    </div>
      <div id="main-container" ref={mainContainerRef}>
      <div>
   
      {isPopupOpen && (
        <>
         <div className="popup">
            <div id = "popup-header">
              <button className = "popup-button" onClick={closePopup}>&#10006;</button>
            </div>
            <div className = "popup-contents-container">
              <div id = "popup-contents">
                <div id = "popup-contents-header">
              
                  <h1>Create a New Obituary</h1>
                 
                  <h2>Image Here</h2>
                  <hr></hr>
                </div>
               
               <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={(event)=>{handleFileChange(event.target.files)}}
                ></input>
                <label htmlFor="file" id="choose-image">
                ↪Select an Image for the Deceased
                </label>
                <span>{selectedFile && `Selected file: ${selectedFileName}`}</span>
                <div className = "popup-contents-main">
                <input
                    id="input-name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                  />
                  <div id = "date-container">
                    
                  <h3>Born:{" "}
                  <input type="datetime-local"
                          value={birthDateTime}
                          onChange={handleBirthDateTimeChange}></input></h3>
                  <h3>
                    Died:{" "}
                    <input
                      type="datetime-local"
                      value={deathDateTime}
                      onChange={handleDeathDateTimeChange}
                    ></input>
                  </h3>
                  </div>
                  
                </div>
                <button
                  onClick={handleWriteObituary}
                  disabled={!birthDateTime || !deathDateTime || !selectedFile||!name}
                  className={!birthDateTime || !deathDateTime ||!name || !selectedFile ? "button-disabled" : "button-enabled"}>
                   Write Obituary</button>

              </div>
            </div>
        </div>

   
        <div className="blur-background"></div>;
        </>
      )}
           <div className = "main-container">
           <Obituary obituaries={obituaries}/>
        </div>
    </div>
    <Outlet />
        {/* <aside id="sidebar" className={collapse ? "hidden" : null}>
          <header>
            <div id="notes-list-heading">
              <h2>Notes</h2>
              <button id="new-note-button" onClick={addNote}>
                +
              </button>
            </div>
          </header>
          <div id="notes-holder">
            <NoteList notes={notes} />
          </div>
        </aside> */}

      </div>
    </div>
  );
}

export default Layout;
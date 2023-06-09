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
  const audioRef = useRef(null);


    // selectedFile is the image that was choosen by the user
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [name, setName] = useState('');

  // want the details of the obituaries to be independent and unique, store in array
  const [obituaries, setObituaries] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [publicId, setPublicId] = useState('');
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const [gptDescription, setGptDescription] = useState("");
  const [fetchedObituaries, setFetchedObituaries] = useState([]);
  const su = audioUrl;
  useEffect(() => {
    console.log("LOADING")
    const fetchObituaries = async () => {
      try {
        const response = await fetch("https://oluenjzsd7mpt6f2mp2qoam7xe0rjhkh.lambda-url.ca-central-1.on.aws/", {
          method: "GET",
          headers: {
            // "Content-Type": "multipart/form-data",
            // "authorization": user.access_token, // Uncomment this if you need to pass an access token
          },
        });

        if (response.status === 200) {
          console.log("SUCCESS!!")
          const obituaries = await response.json();
          setFetchedObituaries(obituaries);
        } else {
          // Handle non-200 status codes as needed
          console.error(`Error fetching obituaries: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching obituaries:", error);
      }
    };

    fetchObituaries();
  }, []); // Add any dependencies as needed

  useEffect(() => {
    if (imageUrl && gptDescription && audioUrl) {
      const newObituary = {
        id: uuidv4(),
        name: name,
        image: imageUrl, // Use the transformed image URL
        birthDate: birthDate,
        deathDate: deathDate,
        description: gptDescription,
        audio: audioUrl
      };
      console.log(newObituary);
      setObituaries([...obituaries, newObituary]);
      setSelectedFile("");
      setSelectedFileName("");
      setBirthDate("");
      setDeathDate("");
      setName("");
      closePopup();
    }
  }, [imageUrl, obituaries, name, birthDate, deathDate]);

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
    setBirthDate(null);
    setDeathDate(null);
    setImageUrl("");
    setGptDescription("");
    setAudioUrl('')

    setIsPopupOpen(false);
  };
  
  // const generateTransformedImageUrl = (publicId, effect) => {
  //   const baseUrl = "https://res.cloudinary.com/dx0n3s9h4/image/upload";
  //   return `${baseUrl}/${effect}/${publicId}`;
  // };
  
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleBirthDateChange = (event) => {
    setBirthDate(event.target.value);
  };
  
  const handleDeathDateChange = (event) => {
    setDeathDate(event.target.value);
  };

const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    setSelectedFile(event.target.files[0]);
    setSelectedFileName(event.target.files[0].name);
  } else {
    setSelectedFile(null);
    setSelectedFileName(null);
  }
  console.log("SELECTED FILE IS" ,selectedFile, "OTHER IS \n",selectedFileName);
};

const handleInputChange = (setStateFunction, event) => {
  setStateFunction(event.target.value);
}; 

const playAudio = () => {
  if (audioRef.current) {
    audioRef.current.play();
  }
};
const handleWriteObituary = async () => {
    if (birthDate && deathDate) {
      const formData = new FormData();
      formData.append("id", uuidv4());
      formData.append("name", name);
      formData.append("image", selectedFile);
      formData.append("birthDate", birthDate);
      formData.append("deathDate", deathDate);



    //the code creates a set of key/value pairs that can be sent as part of an HTTP request. 
    console.log(selectedFile)
    try {
      // sends an HTTP POST request to the URL 
      //passing in the formData object as the request body.
      const response = await axios.post(
        "https://tzduudnsqngo3jwtcb47kzsuva0xuuml.lambda-url.ca-central-1.on.aws/",
        formData
        //
        , //By passing in the formData object as the request body, the code is 
              //sending a set of key/value pairs representing form data to the specified URL.
        {
          //object containing headers for the request.
          headers: {
            "content-type": "multipart/form-data",
          },
        }
      );
      
      console.log("THE RESPONSE: ",response);
      setImageUrl(response.data.image_url);
      setGptDescription(response.data.gpt_response)
      setAudioUrl(response.data.audio_file)

      if (response.status === 200) {  
        console.log("ayy")
      } else {
        alert("Error occurred while creating obituary.");
      }
      
    } catch (error) {
      console.error("Error calling the create-obituary Lambda function:", error);
      alert("Error occurred while creating obituary.");
    }
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
        <div className = "popup">
          <div id = "popup-top"> 
              <button id = "popup-button" onClick={closePopup}><span className = "icon">&lt;</span> Back</button>
          </div>
          <div className = "popup-container">
              <div className = "popup-header">
                <h1>Create a New Obituary</h1>
                 <br></br>
              </div>
              <div className = "popup-info">
                   <div className = "image-input">
                      <input
                        type="file"
                        id="file"
                        accept="image/*"
                        onChange={(event)=>{handleFileChange(event)}}
                      ></input>
                      <label htmlFor="file" id="choose-image">
                      <div id = "select-image">
                        <i className="gg-add"></i>Select an Image for the Deceased
                      </div> 
                      </label>
                      <span>{selectedFile && `Selected file: ${selectedFileName}`}</span>
                    </div>
                <div className = "popup-contents-main">
                <input
                    id="input-name"
                    type="text"
                    value={name}
                    onChange={(event) => handleNameChange(event)}
                  />
                  <div id = "date-container">
                  <h3>Born:{" "}
                  <input type="datetime-local"
                          value={birthDate}
                          onChange={(event) => handleBirthDateChange(event)}
                          ></input></h3>
                  <h3>
                    Died:{" "}
                    <input
                      type="datetime-local"
                      value={deathDate}
                      onChange={(event) => handleDeathDateChange(event)}
                    ></input>
                  </h3>
                  </div>
                  
                </div>
              </div>
              <div className = "popup-bottom">
                <div id = "popup-button">
                  <button
                      onClick={handleWriteObituary}
                      disabled={!birthDate || !deathDate || !selectedFile||!name}
                      className={!birthDate || !deathDate ||!name || !selectedFile ? "button-disabled" : "button-enabled"}>
                      Write Obituary
                  </button>
                </div>
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
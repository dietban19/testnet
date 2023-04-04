import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Obituary from "./Obituary";

const localStorageKey = "lotion-v1";

function Layout() {
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);



  useEffect(() => {
    const height = mainContainerRef.current.offsetHeight;
    mainContainerRef.current.style.maxHeight = `${height}px`;
    const existing = localStorage.getItem(localStorageKey);
    if (existing) {
      try {
        setNotes(JSON.parse(existing));
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (currentNote < 0) {
      return;
    }
    if (!editMode) {
      navigate(`/notes/${currentNote + 1}`);
      return;
    }
    navigate(`/notes/${currentNote + 1}/edit`);
  }, [notes]);

  const saveNote = (note, index) => {
    note.body = note.body.replaceAll("<p><br></p>", "");
    setNotes([
      ...notes.slice(0, index),
      { ...note },
      ...notes.slice(index + 1),
    ]);
    setCurrentNote(index);
    setEditMode(false);
  };

  const deleteNote = (index) => {
    setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
    setCurrentNote(0);
    setEditMode(false);
  };

  const addNote = () => {
    setNotes([
      {
        id: uuidv4(),
        title: "Untitled",
        body: "",
      },
      ...notes,
    ]);
    setEditMode(true);
    setCurrentNote(0);
  };



  // selectedFile is the image that was choosen by the user
  const [selectedFile, setSelectedFile] = useState(null);
  const [birthDateTime, setBirthDateTime] = useState(null);
  const [deathDateTime, setDeathDateTime] = useState(null);
  const [name, setName] = useState('');

  // want the details of the obituaries to be independent and unique, store in array
  const [obituaries, setObituaries] = useState([]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

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
  

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      // const fileData = URL.createObjectURL(event.target.files[0]);
      setSelectedFile(fileData);
    } else {
      setSelectedFile(null);
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
      const newObituary = {
        id: uuidv4(),
        name: name,
        image: selectedFile,
        birthDate: birthDateTime,
        deathDate: deathDateTime,
      };

  
      setObituaries([...obituaries, newObituary]);
      console.log(obituaries)
      console.log(obituaries.image)
  
      URL.revokeObjectURL(selectedFile);

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
                  onChange={handleFileChange}
                ></input>
                <label htmlFor="file" id="choose-image">
                ↪Select an Image for the Deceased
                </label>
                <span>{selectedFile && `Selected file: ${selectedFile}`}</span>
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
       
        <div id="write-box">
          <Outlet context={[notes, saveNote, deleteNote]} />
        </div>
      </div>
    </div>
  );
}

export default Layout;
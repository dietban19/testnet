const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  const formDate = (when) => {
    const formatted = new Date(when).toLocaleString("en-US", options);
    if (formatted === "Invalid Date") {
      return "";
    }
  
    return formatted;
  };
  
  function NewDate({ date }) {
    return <p className="note-when">{formDate(date)}</p>;
  }
  
  export default NewDate;
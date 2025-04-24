import { useState } from "react";
import axios from "axios";
import TypewriterEffect from "../components/typewriterEffect";
import { FaSearch } from "react-icons/fa";

export default function DiseasePrediction() {
  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleInputChange = (e) => {
    setSymptoms(e.target.value);
  };

  const handleSearch = async () => {
    if (!symptoms) return; // Prevent empty submissions

    setIsThinking(true); // Start typewriter effect for "AI is thinking..."
    setPrediction(""); // Clear previous prediction

    try {
      // Replace 'YOUR_API_URL' with the actual endpoint
      const thinkingMessage = ""; // Define the message
      setPrediction(thinkingMessage); // Set the thinking message for display

      const response = await axios.post("http://127.0.0.1:5000/predict", {
        symptoms: symptoms,
      });
      setIsThinking(false); // Stop thinking effect
      setSymptoms("");
      // Assuming the response has the content in the desired format
      setPrediction(response.data.Doctor.response); // Adjust this based on your API response structure
      setInterval(() => {
        console.log("Interval");
      }, 5000);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setPrediction("Error fetching prediction.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ 
    height: "500px", 
    overflowY: "auto", 
    display: "flex", 
    alignItems: "center", 
    flexDirection: "column" 
    }}>
    {prediction ? (
      <div style={{ 
        fontSize: "1.125rem", 
        width: "70%", 
        paddingTop: "2.5rem", 
        marginBottom: "2.5rem", 
        textAlign: "center" 
      }}>
        {isThinking ? (
          <TypewriterEffect text={prediction} repeat={true} speed={100} />
        ) : (
          <TypewriterEffect text={prediction} speed={20} />
        )}
      </div>
    ) : (
      <div style={{ 
        fontSize: "2rem", 
        fontWeight: "bold", 
        textAlign: "center", 
        color: "#444", 
        padding: "1rem" 
      }}>
        Enter your symptoms
      </div>
    )}
    </div>

      <div style={{ width: "100%", display: "flex", justifyContent: "center", borderTop: "1px solid gray", paddingTop: "1rem", marginTop: "100px" }}>
        <div style={{ width: "60%", marginBottom: "1rem", position: "relative" }}>
          <input
            type="text"
            placeholder="Please enter your symptoms..."
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              outline: "none",
              fontSize: "1rem",
            }}
            value={symptoms}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()} // Allow Enter key submission
          />
          <button
            onClick={handleSearch}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span role="img" aria-label="search">
              <FaSearch />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
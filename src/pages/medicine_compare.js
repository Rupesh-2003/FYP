import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MedicineCompare() {
  const [medicineName, setMedicineName] = useState("");
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!medicineName) return;
    setLoading(true);
    setMedicineData(null);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/fetch-medicines",
        { search: medicineName }
      );
      setMedicineData(response.data);
    } catch (error) {
      console.error("Error fetching medicine data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "10%" }}>
      <div style={{ marginTop: "5%" }}>
        <h1
          style={{
            fontSize: "40px",
            fontWeight: "bold",
            textAlign: "center",
            padding: "0 5%",
          }}
        >
          Discover and Compare Medicine Prices in an Instant – Your Health, Your
          Savings!
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "1% 20%",
          }}
        >
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Enter your medicine name"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "20px",
                border: "1px solid black",
                outline: "none",
              }}
            />
            <span
              onClick={handleSearch}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                padding: "10px",
                // borderRadius: "50%",
                // transition: "background 0.3s",
              }}
              onMouseOver={(e) => {
                // e.target.style.background = "black";
                // e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "black";
              }}
            >
              <FaSearch />
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5% 5% 10%",
              gap: "20px",
            }}
          >
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  borderRadius: "20px",
                  height: "200px",
                  width: "400px",
                  background: "#f0f0f0",
                }}
              >
                <div style={{ height: "100px", background: "#e0e0e0" }}></div>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "20px",
                      background: "#e0e0e0",
                      margin: "5px 0",
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Medicine Data Display */}
        {medicineData && medicineData.success && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5% 5% 10%",
              gap: "20px",
            }}
          >
            {/* 1mg Card */}
            {medicineData.one_mg && (
              <div
                style={{
                  width: "400px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <img
                    src="https://www.1mg.com/images/tata_1mg_logo.svg"
                    width="200px"
                    height="100px"
                    alt="1mg"
                  />
                </div>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {medicineData.one_mg.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "medium",
                      color: "gray",
                      fontStyle: "italic",
                    }}
                  >
                    {medicineData.one_mg.pack_size}
                  </p>
                  <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {medicineData.one_mg.price}
                  </p>
                </div>
                <Link to={medicineData.one_mg.url} target="_blank">
                  <button
                    style={{
                      width: "100%",
                      background: "yellow",
                      fontWeight: "bold",
                      color: "black",
                      padding: "10px",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                  >
                    Buy Now
                  </button>
                </Link>
              </div>
            )}

            {/* Apollo Pharmacy Card */}
            {medicineData.apollopharmacy && (
              <div
                style={{
                  width: "400px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <img
                    src="https://images.apollo247.in/images/pharmacy_logo.svg?tr=q-80,w-100,dpr-1,c-at_max"
                    width="200px"
                    height="100px"
                    alt="Apollo"
                  />
                </div>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {medicineData.apollopharmacy.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "medium",
                      color: "gray",
                      fontStyle: "italic",
                    }}
                  >
                    {medicineData.apollopharmacy.unit_size}
                  </p>
                  <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                    ₹{medicineData.apollopharmacy.discount_price}
                  </p>
                </div>
                <Link to={medicineData.apollopharmacy.url} target="_blank">
                  <button
                    style={{
                      width: "100%",
                      background: "yellow",
                      fontWeight: "bold",
                      color: "black",
                      padding: "10px",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                  >
                    Buy Now
                  </button>
                </Link>
              </div>
            )}

            {/* Apollo Pharmacy Card */}
            {medicineData.pharmeasy && (
              <div
                style={{
                  width: "400px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <img
                    src="https://assets.pharmeasy.in/apothecary/images/logo_big.svg?dim=256x0"
                    width="200px"
                    height="100px"
                    alt="Apollo"
                  />
                </div>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {medicineData.pharmeasy.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "medium",
                      color: "gray",
                      fontStyle: "italic",
                    }}
                  >
                    {medicineData.pharmeasy.pack_size}
                  </p>
                  <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                    ₹{medicineData.pharmeasy.price}
                  </p>
                </div>
                <Link to={medicineData.pharmeasy.url} target="_blank">
                  <button
                    style={{
                      width: "100%",
                      background: "yellow",
                      fontWeight: "bold",
                      color: "black",
                      padding: "10px",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                  >
                    Buy Now
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {medicineData && medicineData.success === false && (
          <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", marginTop: "5%" }}>
            Please enter the correct medicine
          </h2>
        )}
      </div>
    </div>
  );
}

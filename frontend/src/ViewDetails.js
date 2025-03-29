import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './View.css';

const server_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

function ViewDetails() {
  const { id } = useParams(); // Get 'id' from URL parameters
  const [data, setData] = useState(null);
  const [profileImage, setProfileImage] = useState(''); // For storing the image URL
  const navigate = useNavigate();

  // Fetch employee details from backend
  useEffect(() => {
    axios.get(`${server_url}/viewdetail/${id}`)
      .then(result => {
        setData(result.data);
        setProfileImage(`${server_url}/${result.data.profileImage}`); // Set image URL        
      })
      .catch(err => console.log(err));
  }, [id]);
  console.log(profileImage);


  if (!data) {
    return <div>Loading...</div>; // If data is not available
  }

  const handleBack = () => {
    navigate("/"); // Navigate back to the main page
  };

  const handleDelete = () => {
    axios.delete(`${server_url}/delete/${id}`)
      .then(() => {
        navigate("/"); // Navigate back to the main page after deletion
      })
      .catch(err => console.log("Error deleting employee", err));
  };

  return (
    <div className="outer">
      <div className="inner">
        <h1>Employee's Complete Details</h1>
        
        <div>
          <h3>Employee Id :</h3>
          <p>{data.employeeId}</p>
        </div>

        <div>
          <h3>Name :</h3>
          <p>{data.name}</p>
        </div>

        <div>
          <h3>Contact :</h3>
          <p>{data.phone}</p>
        </div>

        <div>
          <h3>Date of Birth :</h3>
          <p>{new Date(data.dateOfBirth).toLocaleDateString()}</p>
        </div>

        <div>
          <h3>Date of Joining :</h3>
          <p>{new Date(data.dateOfJoining).toLocaleDateString()}</p>
        </div>

        <div>
          <h3>Employee Department :</h3>
          <p>{data.department}</p>
        </div>

        <div>
          <h3>Employment Status :</h3>
          <p>{data.employmentStatus}</p>
        </div>

        <div>
          <h3>Marital Status :</h3>
          <p>{data.marital === "True" ? 'Married' : 'Unmarried'}</p>
        </div>

        <div>
          <h3>Gender :</h3>
          <p>{data.gender}</p>
        </div>

        <div>
          <h3>Address :</h3>
          <p>{`${data.address.city}, ${data.address.district}, ${data.address.state}`}</p>
        </div>

        <div>
          <h3>Profile Image</h3>
          <div style={{ width: "120px", height: "120px", background: "yellow" }}>
            {/* <img src={profileImage} alt="Employee Profile" /> */}
            <img src={profileImage} alt="Not available" style={{ width: "100%", height: "100%" }}></img>

          </div>
        </div>

        <div>
          <button onClick={handleBack} style={{ background: 'green' }}>Back</button>
          <button onClick={handleDelete} style={{ background: 'red' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default ViewDetails;

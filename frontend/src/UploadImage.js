import React, { useState } from 'react';
import axios from 'axios';
const server_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";


function UploadImage({profileImage, setprofileImage}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Set the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      // Send the POST request using Axios
      const response = await axios.post(`${server_url}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Display a success message with the file path if the request is successful
      if (response.status === 200) {
        setprofileImage(response.data.filePath)
        alert(`Successfully Uploaded. File path: ${response.data.filePath}`);
      }
    } catch (error) {
      // Display an error message if the upload fails
      alert('Upload Failed');
      console.error('Error uploading the file:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <label>Upload your Profile Picture</label>
      <form className='UploadImage' onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          name="profileImage"
          onChange={handleFileChange}
          style={{ margin: "10px", width: "250px" }}
        />
        <button  type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadImage;

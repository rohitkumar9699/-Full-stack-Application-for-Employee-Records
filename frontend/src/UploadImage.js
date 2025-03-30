import React, { useState } from 'react';
import axios from 'axios';
const server_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

function UploadImage({ profileImage, setprofileImage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      const response = await axios.post(`${server_url}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setprofileImage(response.data.imageId);
        alert('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
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
          accept="image/*"
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {profileImage && <p>Image uploaded successfully!</p>}
    </div>
  );
}

export default UploadImage;
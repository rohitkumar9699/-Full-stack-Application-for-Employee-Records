import { city } from './city'; // Ensure 'city' is properly structured and imported
import React, { useState, useEffect } from 'react';
import './App.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const server_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";


function Update() {
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const statefun = () => {
    let all = city.cities.map(item => item.State);
    let unique = [...new Set(all)];
    unique.sort();
    return unique.map((val, index) => (
      <option key={index} value={val}>{val}</option>
    ));
  };

  const fundist = (str) => {
    let all = city.cities
      .filter(item => item.State === str)
      .map(item => item.District);

    let unique = [...new Set(all)];
    unique.sort();

    setDistricts(unique.map((val, index) => (
      <option key={index} value={val}>{val}</option>
    )));
  };

  const fundcity = (str) => {
    let all = city.cities
      .filter(item => item.District === str)
      .map(item => item.City);

    let unique = [...new Set(all)];
    unique.sort();

    setCities(unique.map((val, index) => (
      <option key={index} value={val}>{val}</option>
    )));
  };

  const states = statefun(); // For State

  const depart = [
    "Human Resources",
    "Engineering",
    "Sales",
    "Marketing",
    "Finance",
    "Customer Support",
    "Research and Development",
    "Information Technology"
  ];

  const fundept = () => {
    return depart.map((val, index) => (
      <option key={index} value={val}>{val}</option>
    ));
  };

  const departments = fundept();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    employmentStatus: '',
    marital: '',
    address: {
      city: '',
      district: '',
      state: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'state' || name === 'district' || name === 'city') {
      // Handle nested address fields
      setFormData(prevState => ({
        ...prevState,
        address: {
          ...prevState.address,
          [name]: value
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const { id } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${server_url}/viewdetail/${id}`)
      .then(result => {
        setFormData(result.data); 
      })
      .catch(err => console.log(err)); 
  }, [id]);

  function submitHandle(e) {
    e.preventDefault();
    axios.put(`${server_url}/update/${id}`, {
      employeeId: id,
      ...formData 
    })
    .then((result) => {
      console.log(result);
      navigate('/'); 
    })
    .catch((error) => {
      console.error("There was an error!", error); 
    });
  }
  
  return (
    <div className='add'>
      <form className='add_emp' onSubmit={submitHandle}>
        <label style={{ fontSize: "30px", fontWeight:"800", textAlign:"center", textShadow: "2px 2px 4px red" }}>
          Update Employee Details
        </label>

        <label htmlFor="name">Update your Name</label>
        <input
          onChange={handleChange}
          name="name"
          type="text"
          id="name"
          value={formData.name}
        />

        <label htmlFor="phone">Update your Phone</label>
        <input
          onChange={handleChange}
          name="phone"
          value={formData.phone}
          type="tel"
          id="phone"
          maxLength="10"
          pattern="[0-9]{10}"
          required
        />

        <label htmlFor="department">Update Department</label>
        <select name="department" onChange={handleChange} value={formData.department}>
          <option value="select-Department">Select Department</option>
          {departments}
        </select>

        <label>Employment Status</label>
        <div>
          <input type="radio" name="employmentStatus" value="Full-time" onChange={handleChange} checked={formData.employmentStatus === "Full-time"} />
          <label htmlFor="Full-time">Full-time</label>

          <input type="radio" name="employmentStatus" value="Part-time" onChange={handleChange} checked={formData.employmentStatus === "Part-time"} />
          <label htmlFor="Part-time">Part-time</label>

          <input type="radio" name="employmentStatus" value="Contract" onChange={handleChange} checked={formData.employmentStatus === "Contract"} />
          <label htmlFor="Contract">Contract</label>
        </div>

        <label>Marital Status</label>
        <div>
          <input type="radio" name="marital" value="True" onChange={handleChange} checked={formData.marital === "True"} />
          <label htmlFor="True">Married</label>

          <input type="radio" name="marital" value="False" onChange={handleChange} checked={formData.marital === "False"} />
          <label htmlFor="False">Single</label>
        </div>

        <label>Select your Address</label>
        <div>
          <select name="state" onChange={(e) => { handleChange(e); fundist(e.target.value); }} value={formData.address.state}>
            <option value="select-state">Select State</option>
            {states}
          </select>

          <select name="district" onChange={(e) => { handleChange(e); fundcity(e.target.value); }} value={formData.address.district}>
            <option value="select-district">Select District</option>
            {districts}
          </select>

          <select name="city" onChange={handleChange} value={formData.address.city}>
            <option value="select-city">Select City</option>
            {cities}
          </select>
        </div>
        {/* <UploadImage/> */}
        <button id='submit'>Submit</button>

      </form>

    </div>
  );
}

export default Update;

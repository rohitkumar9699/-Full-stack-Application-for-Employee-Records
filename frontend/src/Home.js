import { useEffect, useState } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const server_url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

function Home() {
  const [employees, setEmployees] = useState([]); // Store fetched employee data
  const [data, setData] = useState([]); // Data to display (filtered or full list)
  const [search, setSearch] = useState(''); // Search input
  const [searchBy, setSearchBy] = useState('id'); // Search filter (id, name, phone)

  // Fetch employees data from the backend
  useEffect(() => {
    axios.get(server_url)
      .then(result => {
        console.log("API Response:", result.data);
        if (Array.isArray(result.data)) {
          setEmployees(result.data);
          setData(result.data);
        } else {
          console.error("Expected an array but got:", typeof result.data);
          setEmployees([]);
          setData([]);
        }
      })
      .catch(err => console.error("Error fetching employees:", err));
  }, []);

  // Search handler
  function searchHandle(event) {
    event.preventDefault(); // Prevent page reload
    
    // Filter data based on search criteria
    const filteredEmployees = employees.filter(employee => {
      if (searchBy === 'id') {
        return employee.employeeId?.toLowerCase().includes(search.toLowerCase());
      } else if (searchBy === 'name') {
        return employee.name?.toLowerCase().includes(search.toLowerCase());
      } else if (searchBy === 'phone') {
        return String(employee.phone || '').includes(search);
      }
      return false;
    });

    setData(filteredEmployees); // Update displayed data
  }

  return (
    <div className="main">
      <h1>Employees Records</h1>
      
      <div className='heading'>
        <Link className='btn' style={{ marginRight: "30%" }} to={`/create`}>Add New Employee</Link>
        
        <form onSubmit={searchHandle}>
          <input 
            onChange={(e) => setSearch(e.target.value)} 
            type="text" 
            placeholder="Search employees" 
          />
          <button style={{ marginLeft: "10px", padding: "5px", marginTop: "2px" }}>Search</button>

          <div>
            <input 
              onChange={(e) => setSearchBy(e.target.value)} 
              type="radio"  
              name="Search" 
              value="id" 
              defaultChecked 
            />
            <label> By Employee ID </label>
            
            <input 
              onChange={(e) => setSearchBy(e.target.value)} 
              type="radio"  
              name="Search" 
              value="name" 
            />
            <label> By Name </label>
            
            <input 
              onChange={(e) => setSearchBy(e.target.value)} 
              type="radio"  
              name="Search" 
              value="phone" 
            />
            <label> By Phone</label>
          </div>
        </form>
      </div>

      <div className="table-out">
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Phone Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.map((employee, idx) => (
              <tr key={employee._id || idx}>
                <td>{idx + 1}</td>
                <td>{employee.name || 'N/A'}</td>
                <td>
                  <Link className='rk' to={`/viewdetail/${employee.employeeId}`} style={{ textDecoration: "none"}}>
                    {employee.employeeId || 'N/A'}
                  </Link>
                </td>
                <td>{employee.department || 'N/A'}</td>
                <td>{employee.phone || 'N/A'}</td>
                <td>
                  <Link className='btn' to={`/update/${employee.employeeId}`}>Update</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
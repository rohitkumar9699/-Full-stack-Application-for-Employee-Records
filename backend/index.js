const express = require('express');
const mongoose = require('mongoose');
const Employee = require("./model/Schema.js");
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const PORT = process.env.PORT || 5000;
// const mongo_connect = "mongodb://localhost:27017/emp";
const mongo_connect =  process.env.mongo_url || "mongodb://localhost:27017/emp";


// Ensure the uploads directory exists
const path = './uploads';
if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
}

// Connect to MongoDB
mongoose.connect(mongo_connect)
    .then(() => console.log("Mongoose Connected Successfully!"))
    .catch(err => console.log("MongoDB Connection Error: ", err));

const app = express();
app.use(express.json());
app.use(cors());

app.get('/check', (req, res) => {
    res.send("<h1>Server started</h1>");
});


// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Ensure the uploads folder exists
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Route to fetch all employees
app.get("/", (req, res) => {
    Employee.find({})
        .then(emp => res.status(200).json(emp))
        .catch(err => res.status(500).json({ error: "Failed to fetch employees", details: err }));
});

// Route to create an employee with image upload
app.post("/create", upload.single('profileImage'), (req, res) => {
    const { name, phone, dateOfBirth, dateOfJoining, department, employmentStatus, marital, gender, address } = req.body;

    if (!name || !phone || !dateOfBirth || !dateOfJoining || !department || !employmentStatus || !gender || !address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const employeeId = department[0].toUpperCase() + "-" + new Date(dateOfJoining).toISOString().substr(0, 4);
    req.body.employeeId = employeeId;

    if (req.file) {
        req.body.profileImage = req.file.path;
    }

    Employee.create(req.body)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).json({ error: "Failed to create employee", details: err }));
});

// Route to fetch specific employee details
app.get("/viewdetail/:id", (req, res) => {
    const { id } = req.params;

    Employee.findOne({ employeeId: id })
        .then(emp => {
            if (!emp) {
                return res.status(404).json({ error: "Employee not found" });
            }
            res.status(200).json(emp);
        })
        .catch(err => res.status(500).json({ error: "Failed to fetch employee", details: err }));
});

// Route to delete an employee by employeeId
app.delete("/delete/:id", (req, res) => {
    const { id } = req.params;

    Employee.findOneAndDelete({ employeeId: id })
        .then(deletedEmp => {
            if (!deletedEmp) {
                return res.status(404).json({ error: "Employee not found" });
            }
            res.status(200).json({ message: "Employee deleted successfully" });
        })
        .catch(err => res.status(500).json({ error: "Failed to delete employee", details: err }));
});

// Route to update employee details
app.put('/update/:id', (req, res) => {
    const { name, phone, department, employmentStatus, marital, address } = req.body;
    const employeeId = req.params.id;

    Employee.findOneAndUpdate(
        { employeeId: employeeId },
        {
            $set: {
                name: name,
                phone: phone,
                department: department,
                employmentStatus: employmentStatus,
                marital: marital,
                'address.city': address.city,
                'address.district': address.district,
                'address.state': address.state
            }
        },
        { new: true, runValidators: true }
    )
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Employee not found" });
            }
            return res.status(200).json({ message: "Employee updated successfully", data: result });
        })
        .catch(err => res.status(500).json({ message: "Error updating employee", error: err }));
});

// Route for file upload
app.post("/upload", (req, res) => {
    upload.single('profileImage')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: 'Multer error', error: err });
        } else if (err) {
            return res.status(500).json({ message: 'Unknown error', error: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({ message: "Successfully Uploaded", filePath: req.file.path });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

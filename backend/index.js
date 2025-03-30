const express = require('express');
const mongoose = require('mongoose');
const Employee = require("./model/Schema.js");
const cors = require('cors');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const mongo_connect = process.env.mongo_url || "mongodb://localhost:27017/emp";

if (!mongo_connect) {
    console.error('MongoDB connection string is undefined. Please check your environment variables.');
    process.exit(1); // Exit the application with an error code
  }
  
  mongoose.connect(mongo_connect)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(express.json());
app.use(cors());

app.get('/check', (req, res) => {
    res.send("<h1>Server started</h1>");
});

// Set up Multer for memory storage (since we'll stream to MongoDB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to fetch all employees
app.get("/", (req, res) => {
    Employee.find({})
        .then(emp => res.status(200).json(emp))
        .catch(err => res.status(500).json({ error: "Failed to fetch employees", details: err }));
});

// Add this new route for image upload only
app.post("/upload", upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'images' });

        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype
        });

        readableStream.pipe(uploadStream);

        await new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
        });

        res.status(200).json({ 
            message: "Image uploaded successfully",
            imageId: uploadStream.id.toString()
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload image", details: err });
    }
});

// Modify the create route to accept imageId instead of file
app.post("/create", async (req, res) => {
    try {
        const { name, phone, dateOfBirth, dateOfJoining, department, 
                employmentStatus, marital, gender, address, imageId } = req.body;

        if (!name || !phone || !dateOfBirth || !dateOfJoining || !department || 
            !employmentStatus || !gender || !address) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const employeeId = department[0].toUpperCase() + "-" + new Date(dateOfJoining).toISOString().substr(0, 4);
        
        const employeeData = {
            name,
            phone,
            dateOfBirth,
            dateOfJoining,
            department,
            employmentStatus,
            marital,
            gender,
            address,
            employeeId,
            profileImage: imageId || null
        };

        const result = await Employee.create(employeeData);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to create employee", details: err });
    }
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

// Route to serve images
app.get("/image/:id", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'images' });

        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const downloadStream = bucket.openDownloadStream(fileId);

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', () => {
            res.status(404).send('Image not found');
        });

        downloadStream.on('end', () => {
            res.end();
        });
    } catch (err) {
        res.status(500).send('Error retrieving image');
    }
});

// Route to delete an employee by employeeId
app.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // First find the employee to get the image ID
        const employee = await Employee.findOne({ employeeId: id });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Delete the image from GridFS if it exists
        if (employee.profileImage) {
            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: 'images' });
            const fileId = new mongoose.Types.ObjectId(employee.profileImage);
            
            try {
                await bucket.delete(fileId);
            } catch (err) {
                console.log("Error deleting image (might not exist):", err);
            }
        }

        // Delete the employee
        await Employee.findOneAndDelete({ employeeId: id });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete employee", details: err });
    }
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

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
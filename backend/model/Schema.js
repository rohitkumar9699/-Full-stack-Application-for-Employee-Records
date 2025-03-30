const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    employmentStatus: {
        type: String,
        required: true
    },
    marital: {
        type: String,
        default: false
    },
    gender: {
        type: String,
        required: true
    },
    profileImage: {
        type: mongoose.Schema.Types.ObjectId,  // Changed to store GridFS file ID
        ref: 'images.files'  // Reference to GridFS collection
    },
    address: {
        state: String,
        district: String,
        city: String
    }
}, { versionKey: false });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
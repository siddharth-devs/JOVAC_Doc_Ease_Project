const express = require('express');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { specialization } = req.query;
    let query = {};
    
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone')
      .select('-__v');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone')
      .select('-__v');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create doctor profile (for doctors)
router.post('/', auth, authorize('doctor'), async (req, res) => {
  try {
    const { specialization, experience, education, consultationFee } = req.body;

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: req.user._id });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const doctor = new Doctor({
      user: req.user._id,
      specialization,
      experience,
      education,
      consultationFee
    });

    await doctor.save();
    await doctor.populate('user', 'name email phone');

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update doctor profile
router.put('/:id', auth, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor's appointments
router.get('/:id/appointments', auth, async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    
    const appointments = await Appointment.find({ doctor: req.params.id })
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

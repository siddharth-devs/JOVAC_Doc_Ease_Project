const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all appointments (for admin) or user's appointments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) {
        query.doctor = doctor._id;
      }
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'specialization consultationFee')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'specialization consultationFee')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor && appointment.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Book appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason
    });

    await appointment.save();
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'specialization consultationFee');
    await appointment.populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    appointment.status = status;
    await appointment.save();

    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'specialization consultationFee');
    await appointment.populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

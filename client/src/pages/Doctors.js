import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Doctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        ...bookingData
      });
      alert('Appointment booked successfully!');
      setShowBookingForm(false);
      setSelectedDoctor(null);
      setBookingData({ appointmentDate: '', appointmentTime: '', reason: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking appointment');
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Doctors</h1>
          <p className="text-gray-600 mt-2">Search and book appointments with qualified doctors</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Dr. {doctor.user.name}
              </h3>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              <p className="text-gray-600 mt-2">{doctor.education}</p>
              <p className="text-gray-600">Experience: {doctor.experience} years</p>
              <p className="text-gray-600">Fee: ₹{doctor.consultationFee}</p>
              <p className="text-gray-600">Rating: {doctor.rating}/5 ({doctor.totalReviews} reviews)</p>
              
              {user && user.role === 'patient' && (
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowBookingForm(true);
                  }}
                  className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No doctors found matching your search</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Book Appointment with Dr. {selectedDoctor.user.name}
            </h3>
            
            <form onSubmit={handleBookAppointment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bookingData.appointmentDate}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      appointmentDate: e.target.value
                    })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Appointment Time
                  </label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bookingData.appointmentTime}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      appointmentTime: e.target.value
                    })}
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Visit
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      reason: e.target.value
                    })}
                    placeholder="Describe your symptoms or reason for the appointment"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedDoctor(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;

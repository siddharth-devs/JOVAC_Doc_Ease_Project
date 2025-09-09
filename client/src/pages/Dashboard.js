import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/appointments/${appointmentId}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'patient' ? 'Manage your appointments' : 'Manage your patient appointments'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {user.role === 'patient' ? 'Your Appointments' : 'Patient Appointments'}
            </h2>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments found</p>
                {user.role === 'patient' && (
                  <a 
                    href="/doctors" 
                    className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Book an Appointment
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.role === 'patient' 
                            ? `Dr. ${appointment.doctor?.user?.name} - ${appointment.doctor?.specialization}`
                            : `Patient: ${appointment.patient?.name}`
                          }
                        </h3>
                        <p className="text-gray-600">
                          Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          Time: {appointment.appointmentTime}
                        </p>
                        <p className="text-gray-600">
                          Reason: {appointment.reason}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {user.role === 'doctor' && appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {user.role === 'patient' && appointment.status !== 'cancelled' && (
                          <button
                            onClick={() => cancelAppointment(appointment._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

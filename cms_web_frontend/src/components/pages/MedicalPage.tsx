import { useState, useEffect } from 'react';
import { Plus, Activity, Phone, MapPin, X, Loader2, RefreshCw } from 'lucide-react';
import medicalFacilitiesAPI from '../../services/medicalFacilities.api';
import { getAllEvents } from '../../services/eventService.ts';

interface Event {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  attendees_count: number;
  status: 'upcoming' | 'live' | 'completed';
  created_at: string;
}

interface MedicalFacility {
  id: string;
  event_id: string;
  facility_name: string;
  facility_type: 'hospital' | 'clinic' | 'first-aid';
  contact_number: string;
  address: string;
  created_at: string;
}

export default function MedicalPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    facility_name: '',
    facility_type: 'hospital' as 'hospital' | 'clinic' | 'first-aid',
    contact_number: '',
    address: ''
  });

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load facilities when event is selected
  useEffect(() => {
    if (selectedEvent) {
      loadFacilities();
    } else {
      setFacilities([]);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    
    try {
      console.log('Loading events...');
      const data = await getAllEvents();
      console.log('Events loaded:', data);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading facilities for event:', selectedEvent);
      const data = await medicalFacilitiesAPI.getFacilitiesByEvent(selectedEvent);
      console.log('Facilities loaded:', data);
      setFacilities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load facilities');
      console.error('Error loading facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting facility for event:', selectedEvent);
      const newFacility = await medicalFacilitiesAPI.createFacility({
        event_id: selectedEvent,
        ...formData
      });
      
      console.log('Facility created:', newFacility);
      
      // Add the new facility to the list
      setFacilities([newFacility, ...facilities]);
      
      // Reset form and close modal
      setShowAddModal(false);
      setFormData({
        facility_name: '',
        facility_type: 'hospital',
        contact_number: '',
        address: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add facility');
      console.error('Error adding facility:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (type: string) => {
    return Activity;
  };

  const getFacilityColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'text-red-400';
      case 'clinic':
        return 'text-blue-400';
      case 'first-aid':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getEventStatusBadge = (status: string) => {
    const statusColors = {
      live: 'bg-green-500/20 text-green-300 border-green-400/30',
      upcoming: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      completed: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    };
    
    return statusColors[status as keyof typeof statusColors] || statusColors.upcoming;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-3xl font-bold text-white">Medical Facilities</h1>
        <button
          onClick={loadEvents}
          disabled={loadingEvents}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
          title="Refresh events"
        >
          <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-gray-300 mb-8">Manage emergency medical contacts and facilities</p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
            disabled={loadingEvents || loading}
          >
            <option value="" style={{ backgroundColor: '#1e293b', color: '#fff' }}>
              {loadingEvents ? 'Loading events...' : 'Select an event'}
            </option>
            {events.map((event) => (
              <option key={event.id} value={event.id} style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                {event.name} - {event.status} ({new Date(event.start_time).toLocaleDateString()})
              </option>
            ))}
          </select>
          {events.length === 0 && !loadingEvents && (
            <p className="text-xs text-gray-400 mt-2">No events available. Please create an event first.</p>
          )}
        </div>

        {selectedEvent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Plus className="w-5 h-5" />
            Add Facility
          </button>
        )}
      </div>

      {selectedEvent && (
        <>
          {loading && !facilities.length ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 mt-4">Loading facilities...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No medical facilities added yet</p>
              <p className="text-gray-500 text-sm mt-2">Click "Add Facility" to create your first entry</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => {
                const Icon = getFacilityIcon(facility.facility_type);
                return (
                  <div
                    key={facility.id}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <Icon className={`w-6 h-6 ${getFacilityColor(facility.facility_type)}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {facility.facility_name}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                          {facility.facility_type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-sm">{facility.contact_number}</span>
                      </div>
                      {facility.address && (
                        <div className="flex items-start gap-3 text-gray-300">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                          <span className="text-sm">{facility.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        Added: {new Date(facility.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!selectedEvent && !loadingEvents && events.length > 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Select an event to view medical facilities</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Medical Facility</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={formData.facility_name}
                  onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., City General Hospital"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility Type *
                </label>
                <select
                  value={formData.facility_type}
                  onChange={(e) => setFormData({ ...formData, facility_type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  disabled={loading}
                >
                  <option value="hospital" style={{ backgroundColor: '#0f172a', color: '#fff' }}>Hospital</option>
                  <option value="clinic" style={{ backgroundColor: '#0f172a', color: '#fff' }}>Clinic</option>
                  <option value="first-aid" style={{ backgroundColor: '#0f172a', color: '#fff' }}>First Aid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="+1234567890"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                  placeholder="Enter full address (optional)"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Facility'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
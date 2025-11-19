// src/pages/WashroomFacilitiesPage.tsx
import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit, RefreshCw } from 'lucide-react';
import { washroomService, WashroomFacility } from '../../services/washroomService';
import { getAllEvents, EventResponse } from '../../services/eventService';

export default function WashroomFacilitiesPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [washrooms, setWashrooms] = useState<WashroomFacility[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWashroom, setEditingWashroom] = useState<WashroomFacility | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'unisex' as 'male' | 'female' | 'unisex',
    floor_level: '',
    capacity: 1,
    availability_status: 'available' as 'available' | 'occupied' | 'maintenance',
    location_details: ''
  });

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load washrooms when event is selected
  useEffect(() => {
    if (selectedEvent) {
      console.log('🎯 Selected event changed to:', selectedEvent);
      loadWashrooms();
    } else {
      setWashrooms([]);
    }
  }, [selectedEvent]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    
    try {
      const data = await getAllEvents();
      console.log('✅ Events loaded:', data);
      setEvents(data);
      
      // If there's only one event, auto-select it
      if (data.length === 1 && !selectedEvent) {
        setSelectedEvent(data[0].id);
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please refresh the page.');
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadWashrooms = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await washroomService.getWashroomsByEvent(selectedEvent);
      const sorted = [...data].sort((a, b) => {
        const order: { [key: string]: number } = { male: 1, female: 2, unisex: 3 };
        return (order[a.gender] || 99) - (order[b.gender] || 99);
      });
      setWashrooms(sorted);
    } catch (err: any) {
      console.error('Error loading washrooms:', err);
      setError(err.message || 'Failed to load washrooms. Please try again.');
      setWashrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await washroomService.createWashroom({
        event_id: selectedEvent,
        name: formData.name,
        gender: formData.gender,
        floor_level: formData.floor_level || null,
        capacity: formData.capacity,
        availability_status: formData.availability_status,
        location_details: formData.location_details || null,
      });

      setSuccessMessage('Washroom created successfully!');
      setShowAddModal(false);
      resetForm();
      await loadWashrooms();
    } catch (err: any) {
      console.error('Error creating washroom:', err);
      setError(err.message || 'Failed to create washroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (washroom: WashroomFacility) => {
    setEditingWashroom(washroom);
    setFormData({
      name: washroom.name,
      gender: washroom.gender,
      floor_level: washroom.floor_level || '',
      capacity: washroom.capacity,
      availability_status: washroom.availability_status,
      location_details: washroom.location_details || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWashroom) return;

    setLoading(true);
    setError(null);

    try {
      await washroomService.updateWashroom(editingWashroom.id, {
        event_id: selectedEvent,
        name: formData.name,
        gender: formData.gender,
        floor_level: formData.floor_level || null,
        capacity: formData.capacity,
        availability_status: formData.availability_status,
        location_details: formData.location_details || null,
      });

      setSuccessMessage('Washroom updated successfully!');
      setShowEditModal(false);
      setEditingWashroom(null);
      resetForm();
      await loadWashrooms();
    } catch (err: any) {
      console.error('Error updating washroom:', err);
      setError(err.message || 'Failed to update washroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'available' | 'occupied' | 'maintenance') => {
    setLoading(true);
    setError(null);

    try {
      await washroomService.updateWashroomStatus(id, status);
      setSuccessMessage('Status updated successfully!');
      await loadWashrooms();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteWashroom = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await washroomService.deleteWashroom(id);
      setSuccessMessage('Washroom deleted successfully!');
      await loadWashrooms();
    } catch (err: any) {
      console.error('Error deleting washroom:', err);
      setError(err.message || 'Failed to delete washroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'unisex',
      floor_level: '',
      capacity: 1,
      availability_status: 'available',
      location_details: ''
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingWashroom(null);
    setError(null);
    resetForm();
  };

  const getGenderColor = (gender: string): string => {
    switch (gender) {
      case 'male':
        return 'from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-300';
      case 'female':
        return 'from-pink-500/20 to-pink-600/20 border-pink-400/30 text-pink-300';
      case 'unisex':
        return 'from-purple-500/20 to-purple-600/20 border-purple-400/30 text-purple-300';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'occupied':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'maintenance':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getEventStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      live: 'bg-green-500/20 text-green-300 border-green-400/30',
      upcoming: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      completed: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    };
    return colors[status] || colors.upcoming;
  };

  const maleWashrooms = washrooms.filter(w => w.gender === 'male');
  const femaleWashrooms = washrooms.filter(w => w.gender === 'female');
  const unisexWashrooms = washrooms.filter(w => w.gender === 'unisex');

  const selectedEventData = events.find(e => e.id === selectedEvent);

  const renderWashroomForm = (onSubmit: (e: React.FormEvent) => void, isEdit = false) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Washroom Name/Location *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          placeholder="e.g., Main Floor Male"
          required
          disabled={loading}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gender Classification *
        </label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'unisex' })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none cursor-pointer"
          disabled={loading}
        >
          <option value="male" className="bg-slate-800 text-white">Male</option>
          <option value="female" className="bg-slate-800 text-white">Female</option>
          <option value="unisex" className="bg-slate-800 text-white">Unisex</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Floor/Level
        </label>
        <input
          type="text"
          value={formData.floor_level}
          onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          placeholder="e.g., Ground Floor, 1st Floor"
          disabled={loading}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Capacity (Number of Stalls) *
        </label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          min="1"
          required
          disabled={loading}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location Details
        </label>
        <textarea
          value={formData.location_details}
          onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          placeholder="e.g., Near entrance, wheelchair accessible"
          rows={2}
          disabled={loading}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{isEdit ? 'Updating...' : 'Adding...'}</span>
          </>
        ) : (
          <span>{isEdit ? 'Update Washroom' : 'Add Washroom'}</span>
        )}
      </button>
    </form>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Washroom Facilities</h1>
        <button
          onClick={loadEvents}
          disabled={loadingEvents}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50"
          title="Refresh events"
        >
          <RefreshCw className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh Events</span>
        </button>
      </div>
      <p className="text-gray-300 mb-8">Manage and monitor washroom availability by gender classification</p>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-300 hover:text-green-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Event Selection and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <select
            value={selectedEvent}
            onChange={(e) => {
              console.log('Event selected:', e.target.value);
              setSelectedEvent(e.target.value);
            }}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 [&>option]:text-gray-900 [&>option]:bg-white"
            disabled={loading || loadingEvents}
          >
            <option value="" className="text-gray-900 bg-white">
              {loadingEvents ? 'Loading events...' : 'Select an event'}
            </option>
            {events.length === 0 && !loadingEvents ? (
              <option value="" disabled className="text-gray-500 bg-white">No events available</option>
            ) : (
              events.map((event) => (
                <option key={event.id} value={event.id} className="text-gray-900 bg-white">
                  {event.name} ({event.location})
                </option>
              ))
            )}
          </select>
        </div>

        {selectedEvent && (
          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Washroom
          </button>
        )}
      </div>

      {/* Selected Event Info */}
      {selectedEventData && (
        <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{selectedEventData.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border uppercase ${getEventStatusBadge(selectedEventData.status)}`}>
                  {selectedEventData.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{selectedEventData.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span>📍 {selectedEventData.location}</span>
                <span>👥 Capacity: {selectedEventData.capacity}</span>
                <span>📅 {new Date(selectedEventData.start_time).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Events State */}
      {loadingEvents && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-4 text-gray-300">Loading events...</span>
        </div>
      )}

      {/* No Events Warning */}
      {!loadingEvents && events.length === 0 && (
        <div className="text-center py-12 bg-yellow-500/10 rounded-xl border border-yellow-400/20">
          <p className="text-yellow-300 text-lg mb-2">No events found</p>
          <p className="text-yellow-400/70">Please create an event first before adding washroom facilities.</p>
        </div>
      )}

      {/* Loading Washrooms State */}
      {loading && !showAddModal && !showEditModal && selectedEvent && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-4 text-gray-300">Loading washrooms...</span>
        </div>
      )}

      {/* Empty State - Event selected but no washrooms */}
      {!loading && selectedEvent && washrooms.length === 0 && events.length > 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <p className="text-gray-400 text-lg mb-2">No washrooms added yet</p>
          <p className="text-gray-500">Click "Add Washroom" to create your first facility for this event</p>
        </div>
      )}

      {/* Washrooms Display */}
      {!loading && selectedEvent && washrooms.length > 0 && (
        <div className="space-y-8">
          {[
            { title: 'Male Washrooms', icon: '♂', washrooms: maleWashrooms, color: 'from-blue-500/10' },
            { title: 'Female Washrooms', icon: '♀', washrooms: femaleWashrooms, color: 'from-pink-500/10' },
            { title: 'Unisex Washrooms', icon: '⚬', washrooms: unisexWashrooms, color: 'from-purple-500/10' }
          ].map((section) => (
            section.washrooms.length > 0 && (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${section.color}`}>
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  <span className="text-sm text-gray-400">({section.washrooms.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {section.washrooms.map((washroom) => (
                    <div
                      key={washroom.id}
                      className={`bg-gradient-to-br ${getGenderColor(washroom.gender)} backdrop-blur-lg rounded-xl p-6 border`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {washroom.name}
                          </h3>
                          {washroom.floor_level && (
                            <p className="text-sm text-gray-300">{washroom.floor_level}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(washroom)}
                            disabled={loading}
                            className="text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
                            title="Edit washroom"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteWashroom(washroom.id, washroom.name)}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
                            title="Delete washroom"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Capacity:</span>
                          <span className="text-white font-medium">{washroom.capacity} stalls</span>
                        </div>
                        {washroom.location_details && (
                          <div className="text-xs text-gray-300 bg-white/5 p-2 rounded-lg">
                            {washroom.location_details}
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center justify-center py-2 rounded-lg border mb-4 ${getStatusColor(washroom.availability_status)}`}>
                        <span className="font-semibold uppercase text-sm">
                          {washroom.availability_status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mb-4">
                        Last updated: {new Date(washroom.updated_at).toLocaleString()}
                      </p>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 mb-2">Update Status:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => updateStatus(washroom.id, 'available')}
                            disabled={loading || washroom.availability_status === 'available'}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed ${
                              washroom.availability_status === 'available'
                                ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                                : 'bg-green-500/10 text-green-300 hover:bg-green-500/20'
                            }`}
                          >
                            Available
                          </button>
                          <button
                            onClick={() => updateStatus(washroom.id, 'occupied')}
                            disabled={loading || washroom.availability_status === 'occupied'}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed ${
                              washroom.availability_status === 'occupied'
                                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                            }`}
                          >
                            Occupied
                          </button>
                          <button
                            onClick={() => updateStatus(washroom.id, 'maintenance')}
                            disabled={loading || washroom.availability_status === 'maintenance'}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed ${
                              washroom.availability_status === 'maintenance'
                                ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                                : 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                            }`}
                          >
                            Maintenance
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Add Washroom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Washroom</h2>
              <button
                onClick={closeModals}
                disabled={loading}
                className="text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {renderWashroomForm(handleSubmit)}
          </div>
        </div>
      )}

      {/* Edit Washroom Modal */}
      {showEditModal && editingWashroom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Washroom</h2>
              <button
                onClick={closeModals}
                disabled={loading}
                className="text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {renderWashroomForm(handleUpdate, true)}
          </div>
        </div>
      )}
    </div>
  );
}
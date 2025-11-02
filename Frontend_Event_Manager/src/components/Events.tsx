import { useState } from 'react';
import { Calendar, MapPin, Users, Plus, ArrowLeft } from 'lucide-react';
import EventDashboard from './EventDashboard.tsx';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  status: 'upcoming' | 'live' | 'completed';
  zones?: {
    id: string;
    name: string;
    count: number;
    capacity: number;
    level: 'safe' | 'moderate' | 'risky' | 'critical';
  }[];
}

export default function Events() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Summer Music Festival',
      date: '2025-11-15',
      location: 'Central Park',
      capacity: 5000,
      status: 'upcoming',
      zones: [
        { id: '1', name: 'Main Stage', count: 850, capacity: 1000, level: 'moderate' },
        { id: '2', name: 'Food Court', count: 450, capacity: 800, level: 'safe' },
        { id: '3', name: 'VIP Area', count: 200, capacity: 300, level: 'moderate' }
      ]
    },
    {
      id: '2',
      name: 'Tech Conference 2025',
      date: '2025-10-25',
      location: 'Convention Center',
      capacity: 2000,
      status: 'live',
      zones: [
        { id: '1', name: 'Main Hall', count: 850, capacity: 1000, level: 'moderate' },
        { id: '2', name: 'Workshop Area', count: 450, capacity: 500, level: 'risky' },
        { id: '3', name: 'Exhibition Space', count: 600, capacity: 800, level: 'safe' }
      ]
    },
  ]);

  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'status'>>({
    name: '',
    date: '',
    location: '',
    capacity: 0
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: (events.length + 1).toString(),
      ...newEvent,
      status: 'upcoming'
    };
    setEvents([...events, event]);
    setNewEvent({ name: '', date: '', location: '', capacity: 0 });
    setShowAddModal(false);
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedEvent) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setSelectedEvent(null)}
            className="flex items-center text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 mt-4">{selectedEvent.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
              {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
            </span>
            <span className="text-sm text-slate-600">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(selectedEvent.date).toLocaleDateString()}
            </span>
            <span className="text-sm text-slate-600">
              <MapPin className="w-4 h-4 inline mr-1" />
              {selectedEvent.location}
            </span>
          </div>
        </div>
        <EventDashboard event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-slate-900">{event.name}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="w-4 h-4 mr-2" />
                Capacity: {event.capacity.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newEvent.capacity || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
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
}
import { useState } from 'react';
import { AlertTriangle, Users, Heart, MapPin, TrendingUp, Clock, Calendar, Plus, ArrowLeft } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  count: number;
  capacity: number;
  level: 'safe' | 'moderate' | 'risky' | 'critical';
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  status: 'upcoming' | 'live' | 'completed';
  zones: Zone[];
}

export default function Dashboard() {
  // const [showAddModal, setShowAddModal] = useState(false);
  // const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'status' | 'zones'>>({
  //   name: '',
  //   date: '',
  //   location: '',
  //   capacity: 0
  // });

  // const [events, setEvents] = useState<Event[]>([
  //   {
  //     id: '1',
  //     name: 'Summer Music Festival',
  //     date: '2025-11-15',
  //     location: 'Central Park',
  //     capacity: 5000,
  //     status: 'upcoming',
  //     zones: [
  //       { id: '1', name: 'Main Stage', count: 850, capacity: 1000, level: 'moderate' },
  //       { id: '2', name: 'Food Court', count: 450, capacity: 800, level: 'safe' },
  //       { id: '3', name: 'VIP Area', count: 200, capacity: 300, level: 'moderate' }
  //     ]
  //   },
  //   {
  //     id: '2',
  //     name: 'Tech Conference 2025',
  //     date: '2025-10-25',
  //     location: 'Convention Center',
  //     capacity: 2000,
  //     status: 'live',
  //     zones: [
  //       { id: '1', name: 'Main Hall', count: 850, capacity: 1000, level: 'moderate' },
  //       { id: '2', name: 'Workshop Area', count: 450, capacity: 500, level: 'risky' },
  //       { id: '3', name: 'Exhibition Space', count: 600, capacity: 800, level: 'safe' }
  //     ]
  //   }
  // ]);
  const [showAddModal, setShowAddModal] = useState(false);
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
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'status' | 'zones'>>({
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
      status: 'upcoming',
      zones: []
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

  // If no event is selected, show the events list
  if (!selectedEvent) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-900">Event Management</h1>
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

  // Event dashboard view - showing zones and monitoring data for the selected event
  const zones = selectedEvent.zones;

  const getDensityColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'risky':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOccupancyPercentage = (count: number, capacity: number) => {
    return Math.round((count / capacity) * 100);
  };

  const criticalZones = zones.filter(z => z.level === 'critical' || z.level === 'risky');
  const totalAttendees = zones.reduce((sum, zone) => sum + zone.count, 0);
  const avgOccupancy = Math.round(zones.reduce((sum, zone) => sum + getOccupancyPercentage(zone.count, zone.capacity), 0) / zones.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setSelectedEvent(null)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 ml-4">{selectedEvent.name}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Attendees</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalAttendees.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">12%</span>
            <span className="text-slate-500 ml-1">vs last hour</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Critical Zones</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{criticalZones.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Require immediate attention
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Alerts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            3 medical, 5 density alerts
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Occupancy</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{avgOccupancy}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Across all zones
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Zone Density Monitor</h2>
              <p className="text-sm text-slate-600 mt-1">Real-time crowd density across event zones</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {zones.map((zone) => {
                  const percentage = getOccupancyPercentage(zone.count, zone.capacity);
                  return (
                    <div key={zone.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{zone.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-slate-600">
                            {zone.count.toLocaleString()} / {zone.capacity.toLocaleString()}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDensityColor(zone.level)}`}>
                            {zone.level.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full bg-slate-100 rounded-full h-3">
                        <div
                          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${
                            zone.level === 'critical'
                              ? 'bg-red-500'
                              : zone.level === 'risky'
                              ? 'bg-orange-500'
                              : zone.level === 'moderate'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500">{percentage}% capacity</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Active Alerts</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900">Critical Density</p>
                    <p className="text-xs text-red-700 mt-1">Food Court Area exceeding safe capacity</p>
                    <div className="flex items-center mt-2 text-xs text-red-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>2 min ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Heart className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-orange-900">Medical Emergency</p>
                    <p className="text-xs text-orange-700 mt-1">Stage Front - Heat exhaustion reported</p>
                    <div className="flex items-center mt-2 text-xs text-orange-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>5 min ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-yellow-900">Lost Person Report</p>
                    <p className="text-xs text-yellow-700 mt-1">Child, age 7, last seen near Main Entrance</p>
                    <div className="flex items-center mt-2 text-xs text-yellow-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>12 min ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900">Exit Update</p>
                    <p className="text-xs text-blue-700 mt-1">Emergency Exit 3 flow rate increasing</p>
                    <div className="flex items-center mt-2 text-xs text-blue-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>18 min ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Quick Stats</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Lost Person Reports</span>
                <span className="text-sm font-semibold text-slate-900">3 Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Medical Emergencies</span>
                <span className="text-sm font-semibold text-slate-900">2 Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Open Emergency Exits</span>
                <span className="text-sm font-semibold text-slate-900">8 / 10</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Feedback Received</span>
                <span className="text-sm font-semibold text-slate-900">127</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/LostPersonsPage.tsx
import { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, Phone, MapPin, Filter, User, Loader2 } from 'lucide-react';
import { lostPersonsService, LostPerson, LostPersonStats } from '../../services/lostPersonsService';
import { getAllEvents, EventResponse } from '../../services/eventService';

// Component to handle photo display with error handling
function PersonPhoto({ person }: { person: LostPerson }) {
  const [imageError, setImageError] = useState(false);
  const photoUrl = person.photo_url ? lostPersonsService.getPhotoUrl(person.photo_url) : null;

  // Reset error state when person changes
  useEffect(() => {
    setImageError(false);
  }, [person.id, photoUrl]);

  if (!photoUrl || imageError) {
    return (
      <div className="w-24 h-24 rounded-lg bg-white/5 flex flex-col items-center justify-center border border-white/10">
        <User className="w-8 h-8 text-gray-500 mb-1" />
        <span className="text-xs text-gray-500">No Photo</span>
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={person.name}
      className="w-24 h-24 rounded-lg object-cover border border-white/10"
      onError={() => setImageError(true)}
    />
  );
}

export default function LostPersonsPage() {
  const [lostPersons, setLostPersons] = useState<LostPerson[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [stats, setStats] = useState<LostPersonStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Load lost persons when filters change
  useEffect(() => {
    if (!loadingEvents) {
      loadLostPersons();
    }
  }, [selectedEvent, filterStatus, filterPriority, loadingEvents]);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const eventsData = await getAllEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadLostPersons = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: LostPerson[] = [];

      // Apply filters based on selection priority
      // Priority: Status > Priority > Event > All
      if (filterStatus !== 'all') {
        data = await lostPersonsService.getReportsByStatus(filterStatus);
      } else if (filterPriority !== 'all') {
        data = await lostPersonsService.getReportsByPriority(filterPriority);
      } else if (selectedEvent !== 'all') {
        data = await lostPersonsService.getReportsByEvent(selectedEvent);
      } else {
        data = await lostPersonsService.getAllReports();
      }

      // Additional filtering if event is selected along with status/priority
      if (selectedEvent !== 'all' && (filterStatus !== 'all' || filterPriority !== 'all')) {
        data = data.filter(person => person.event_id === selectedEvent);
      }

      setLostPersons(data);

      // Load stats if an event is selected
      if (selectedEvent !== 'all') {
        try {
          const eventStats = await lostPersonsService.getEventStats(selectedEvent);
          setStats(eventStats);
        } catch (err) {
          // If stats API fails, calculate manually
          console.warn('Failed to fetch event stats, calculating manually');
          calculateStatsManually(data);
        }
      } else {
        // Calculate stats manually from all data
        calculateStatsManually(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lost persons');
      console.error('Error loading lost persons:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsManually = (data: LostPerson[]) => {
    setStats({
      total: data.length,
      by_status: {
        reported: data.filter(p => p.status === 'missing').length,
        searching: data.filter(p => p.status === 'searching').length,
        found: data.filter(p => p.status === 'found').length,
        resolved: data.filter(p => p.status === 'resolved').length,
      },
      by_priority: {
        critical: data.filter(p => p.priority === 'critical').length,
        high: data.filter(p => p.priority === 'high').length,
        medium: data.filter(p => p.priority === 'medium').length,
        low: data.filter(p => p.priority === 'low').length,
      },
    });
  };

  const updateStatus = async (id: string, status: 'searching' | 'found' | 'resolved') => {
    try {
      console.log('Updating status:', { id, status });
      setError(null);
      await lostPersonsService.updateStatus(id, status);
      await loadLostPersons();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      console.error('Error updating status:', { id, status, error: err });
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found':
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'searching':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Lost Persons Management</h1>
      <p className="text-gray-300 mb-8">Track and manage lost person reports across all events</p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total Cases</p>
              <p className="text-3xl font-bold text-white">{stats?.total || 0}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-amber-500/20 backdrop-blur-lg rounded-xl p-6 border border-amber-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-200 text-sm mb-1">Missing</p>
              <p className="text-3xl font-bold text-white">{stats?.by_status.reported || 0}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="bg-purple-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Searching</p>
              <p className="text-3xl font-bold text-white">{stats?.by_status.searching || 0}</p>
            </div>
            <Search className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Found</p>
              <p className="text-3xl font-bold text-white">{stats?.by_status.found || 0}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter by Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            disabled={loadingEvents}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="all" className="bg-gray-800 text-white">
              {loadingEvents ? 'Loading events...' : 'All Events'}
            </option>
            {events.map((event) => (
              <option key={event.id} value={event.id} className="bg-gray-800 text-white">
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="all" className="bg-gray-800 text-white">All Statuses</option>
            <option value="missing" className="bg-gray-800 text-white">Missing</option>
            <option value="searching" className="bg-gray-800 text-white">Searching</option>
            <option value="found" className="bg-gray-800 text-white">Found</option>
            <option value="resolved" className="bg-gray-800 text-white">Resolved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter by Priority
          </label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="all" className="bg-gray-800 text-white">All Priorities</option>
            <option value="critical" className="bg-gray-800 text-white">Critical</option>
            <option value="high" className="bg-gray-800 text-white">High</option>
            <option value="medium" className="bg-gray-800 text-white">Medium</option>
            <option value="low" className="bg-gray-800 text-white">Low</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="inline-block w-12 h-12 animate-spin text-blue-400" />
          <p className="text-gray-300 mt-4">Loading lost persons...</p>
        </div>
      )}

      {/* Lost Persons List */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lostPersons.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">
              No lost person reports found
              {selectedEvent !== 'all' && (
                <p className="text-sm mt-2">
                  Try selecting "All Events" or changing your filters
                </p>
              )}
            </div>
          ) : (
            lostPersons.map((person) => (
              <div
                key={person.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition"
              >
                <div className="flex gap-4">
                  <PersonPhoto person={person} />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">{person.name}</h3>
                        <p className="text-gray-300 text-sm">
                          {person.age} years • {person.gender}
                        </p>
                        <p className={`text-xs mt-1 ${getPriorityColor(person.priority)}`}>
                          Priority: {person.priority.toUpperCase()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(person.status)}`}>
                        {person.status}
                      </span>
                    </div>

                    {/* Event Badge */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30">
                        <MapPin className="w-3 h-3" />
                        {getEventName(person.event_id)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>Last seen: {person.last_seen_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>{person.last_seen_time}</span>
                      </div>
                    </div>

                    {person.description && (
                      <p className="text-sm text-gray-300 mb-4 p-3 bg-white/5 rounded-lg">
                        {person.description}
                      </p>
                    )}

                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-gray-400 mb-2">Reporter Details:</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{person.reporter_name}</span>
                        <div className="flex items-center gap-2 text-blue-300">
                          <Phone className="w-4 h-4" />
                          <span>{person.reporter_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {person.status === 'missing' && (
                        <>
                          <button
                            onClick={() => updateStatus(person.id, 'searching')}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg font-medium transition"
                          >
                            Start Search
                          </button>
                          <button
                            onClick={() => updateStatus(person.id, 'found')}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 rounded-lg font-medium transition"
                          >
                            Mark Found
                          </button>
                        </>
                      )}
                      {person.status === 'searching' && (
                        <button
                          onClick={() => updateStatus(person.id, 'found')}
                          className="col-span-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 rounded-lg font-medium transition"
                        >
                          Mark as Found
                        </button>
                      )}
                      {person.status === 'found' && (
                        <button
                          onClick={() => updateStatus(person.id, 'resolved')}
                          className="col-span-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 rounded-lg font-medium transition"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Plus, DoorOpen, X, Trash2, AlertCircle } from 'lucide-react';
import { emergencyExitsAPI, EmergencyExit } from '../../services/emergencyExitsAPI';

interface Event {
  id: string;
  name: string;
}

interface EmergencyExitsPageProps {
  events: Event[];
}

export default function EmergencyExitsPage({ events }: EmergencyExitsPageProps) {
  const [exits, setExits] = useState<EmergencyExit[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    exit_name: '',
    location: '',
    status: 'clear' as 'crowded' | 'moderate' | 'clear'
  });

  useEffect(() => {
    if (selectedEvent) {
      loadExits();
    }
  }, [selectedEvent]);

  const loadExits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emergencyExitsAPI.getExitsByEvent(selectedEvent);
      // Filter exits for the selected event only
      const filteredExits = data.filter(exit => exit.event_id === selectedEvent);
      setExits(filteredExits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exits');
      console.error('Error loading exits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await emergencyExitsAPI.createExit({
        event_id: selectedEvent,
        ...formData
      });

      setShowAddModal(false);
      setFormData({
        exit_name: '',
        location: '',
        status: 'clear'
      });
      
      await loadExits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exit');
      console.error('Error creating exit:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateExitStatus = async (id: string, status: 'crowded' | 'moderate' | 'clear') => {
    try {
      setError(null);
      await emergencyExitsAPI.updateExitStatus(id, status);
      await loadExits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Error updating exit status:', err);
    }
  };

  const deleteExit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exit?')) {
      return;
    }

    try {
      setError(null);
      await emergencyExitsAPI.deleteExit(id);
      await loadExits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exit');
      console.error('Error deleting exit:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clear':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'crowded':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Emergency Exits</h1>
      <p className="text-gray-300 mb-8">Monitor and update emergency exit status in real-time</p>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>

        {selectedEvent && (
          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Add Exit
          </button>
        )}
      </div>

      {loading && !exits.length && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="text-gray-400 mt-4">Loading exits...</p>
        </div>
      )}

      {selectedEvent && !loading && exits.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <DoorOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No emergency exits found for this event</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Exit" to create one</p>
        </div>
      )}

      {selectedEvent && exits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exits.map((exit) => (
            <div
              key={exit.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <DoorOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {exit.exit_name}
                  </h3>
                  <p className="text-sm text-gray-300">{exit.location}</p>
                </div>
                <button
                  onClick={() => deleteExit(exit.id)}
                  className="text-gray-400 hover:text-red-400 transition"
                  title="Delete exit"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className={`flex items-center justify-center py-2 rounded-lg border mb-4 ${getStatusColor(exit.status)}`}>
                <span className="font-semibold uppercase text-sm">
                  {exit.status}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Last updated: {new Date(exit.last_updated).toLocaleString()}
              </p>

              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">Update Status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateExitStatus(exit.id, 'clear')}
                    disabled={loading}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed ${
                      exit.status === 'clear'
                        ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                        : 'bg-green-500/10 text-green-300 hover:bg-green-500/20'
                    }`}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => updateExitStatus(exit.id, 'moderate')}
                    disabled={loading}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed ${
                      exit.status === 'moderate'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                        : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => updateExitStatus(exit.id, 'crowded')}
                    disabled={loading}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed ${
                      exit.status === 'crowded'
                        ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                        : 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                    }`}
                  >
                    Crowded
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Emergency Exit</h2>
              <button
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="text-gray-400 hover:text-white transition disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exit Name
                </label>
                <input
                  type="text"
                  value={formData.exit_name}
                  onChange={(e) => setFormData({ ...formData, exit_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                >
                  <option value="clear">Clear</option>
                  <option value="moderate">Moderate</option>
                  <option value="crowded">Crowded</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
              >
                {loading ? 'Adding...' : 'Add Exit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
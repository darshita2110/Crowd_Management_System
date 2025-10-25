import { useState } from 'react';
import { DoorOpen, MapPin, Users, TrendingUp, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

interface EmergencyExit {
  id: string;
  exitName: string;
  location: string;
  capacity: number;
  currentFlowRate: number;
  status: 'open' | 'crowded' | 'blocked' | 'closed' | 'emergency_only';
  isRecommended: boolean;
  notes: string;
}

export default function EmergencyExits() {
  const [selectedExit, setSelectedExit] = useState<EmergencyExit | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [exits, setExits] = useState<EmergencyExit[]>([
    {
      id: '1',
      exitName: 'North Exit A',
      location: 'North Wing - Main Corridor',
      capacity: 500,
      currentFlowRate: 120,
      status: 'open',
      isRecommended: true,
      notes: 'Primary exit for north sections',
    },
    {
      id: '2',
      exitName: 'South Exit B',
      location: 'South Wing - Near Food Court',
      capacity: 450,
      currentFlowRate: 380,
      status: 'crowded',
      isRecommended: false,
      notes: 'High traffic due to food court proximity',
    },
    {
      id: '3',
      exitName: 'East Emergency Exit',
      location: 'East Wing - Stage Area',
      capacity: 600,
      currentFlowRate: 0,
      status: 'emergency_only',
      isRecommended: false,
      notes: 'Reserved for emergencies - keep clear',
    },
    {
      id: '4',
      exitName: 'West Exit C',
      location: 'West Wing - Parking Access',
      capacity: 400,
      currentFlowRate: 85,
      status: 'open',
      isRecommended: true,
      notes: 'Direct parking lot access',
    },
    {
      id: '5',
      exitName: 'Central Exit D',
      location: 'Central Hall - Main Entrance',
      capacity: 800,
      currentFlowRate: 720,
      status: 'crowded',
      isRecommended: false,
      notes: 'Main entrance - high congestion expected',
    },
    {
      id: '6',
      exitName: 'Service Exit E',
      location: 'Back Area - Service Road',
      capacity: 300,
      currentFlowRate: 0,
      status: 'blocked',
      isRecommended: false,
      notes: 'Temporarily blocked for equipment delivery',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'crowded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'emergency_only':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'crowded':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'blocked':
      case 'closed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'emergency_only':
        return <DoorOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <DoorOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  const getUtilizationPercentage = (flowRate: number, capacity: number) => {
    return Math.round((flowRate / capacity) * 100);
  };

  const openExits = exits.filter((e) => e.status === 'open').length;
  const crowdedExits = exits.filter((e) => e.status === 'crowded').length;
  const blockedExits = exits.filter((e) => e.status === 'blocked' || e.status === 'closed').length;
  const totalCapacity = exits.reduce((sum, exit) => sum + exit.capacity, 0);
  const totalFlowRate = exits.reduce((sum, exit) => sum + exit.currentFlowRate, 0);

  const handleUpdateStatus = (exitId: string, newStatus: EmergencyExit['status']) => {
    setExits(exits.map((exit) =>
      exit.id === exitId ? { ...exit, status: newStatus } : exit
    ));
  };

  const handleToggleRecommendation = (exitId: string) => {
    setExits(exits.map((exit) =>
      exit.id === exitId ? { ...exit, isRecommended: !exit.isRecommended } : exit
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emergency Exits & Routes</h1>
          <p className="text-sm text-slate-600 mt-1">Monitor and manage exit status and crowd flow</p>
        </div>
        <button
          onClick={() => setShowAlertModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Bell className="w-4 h-4" />
          <span>Raise Alert</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Exits</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{exits.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            {openExits} open, {crowdedExits} crowded
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Open & Available</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{openExits}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Operating normally
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Crowded/Blocked</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{crowdedExits + blockedExits}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Require attention
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Capacity</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalCapacity}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            People per minute
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Exit Status Overview</h2>
          <p className="text-sm text-slate-600 mt-1">Real-time monitoring of all emergency exits</p>
        </div>
        <div className="divide-y divide-slate-200">
          {exits.map((exit) => {
            const utilization = getUtilizationPercentage(exit.currentFlowRate, exit.capacity);
            return (
              <div
                key={exit.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(exit.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{exit.exitName}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(exit.status)}`}>
                          {exit.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {exit.isRecommended && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{exit.location}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Current Flow Rate</p>
                          <p className="text-lg font-semibold text-slate-900">{exit.currentFlowRate} <span className="text-xs font-normal text-slate-600">people/min</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Capacity</p>
                          <p className="text-lg font-semibold text-slate-900">{exit.capacity} <span className="text-xs font-normal text-slate-600">people/min</span></p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Utilization</span>
                          <span className="font-medium text-slate-900">{utilization}%</span>
                        </div>
                        <div className="relative w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${
                              utilization > 90
                                ? 'bg-red-500'
                                : utilization > 70
                                ? 'bg-orange-500'
                                : utilization > 50
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                      {exit.notes && (
                        <p className="text-sm text-slate-500 mt-3 italic">{exit.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setSelectedExit(exit)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleToggleRecommendation(exit.id)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        exit.isRecommended
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {exit.isRecommended ? 'Recommended' : 'Recommend'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Manage Exit: {selectedExit.exitName}</h2>
                <button
                  onClick={() => setSelectedExit(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-3">Update Exit Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['open', 'crowded', 'blocked', 'closed', 'emergency_only'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleUpdateStatus(selectedExit.id, status);
                        setSelectedExit({ ...selectedExit, status });
                      }}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedExit.status === status
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Exit Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Location:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedExit.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Capacity:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedExit.capacity} people/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Current Flow:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedExit.currentFlowRate} people/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Recommended:</span>
                    <span className={`text-sm font-medium ${selectedExit.isRecommended ? 'text-green-700' : 'text-slate-900'}`}>
                      {selectedExit.isRecommended ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedExit(null)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setSelectedExit(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Raise Exit Alert</h2>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Exit</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Choose an exit...</option>
                  {exits.map((exit) => (
                    <option key={exit.id} value={exit.id}>
                      {exit.exitName} - {exit.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alert Type</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="crowding">Exit Crowding</option>
                  <option value="blockage">Exit Blockage</option>
                  <option value="redirect">Redirect Crowd</option>
                  <option value="emergency">Emergency Evacuation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter alert message for attendees..."
                />
              </div>
              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Send Alert
                </button>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

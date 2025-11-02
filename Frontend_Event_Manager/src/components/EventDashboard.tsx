import { AlertTriangle, Users, Heart, MapPin, TrendingUp, Clock } from 'lucide-react';

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
  zones?: Zone[];
}

interface EventDashboardProps {
  event: Event;
}

export default function EventDashboard({ event }: EventDashboardProps) {
  const zones = event.zones || [];

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
  const avgOccupancy = zones.length 
    ? Math.round(zones.reduce((sum, zone) => sum + getOccupancyPercentage(zone.count, zone.capacity), 0) / zones.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Current Attendees</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalAttendees.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">{Math.round((totalAttendees / event.capacity) * 100)}%</span>
            <span className="text-slate-500 ml-1">of capacity</span>
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
              <p className="text-3xl font-bold text-slate-900 mt-1">{criticalZones.length * 2}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            {criticalZones.length} density, {criticalZones.length} medical
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
                {criticalZones.map(zone => (
                  <div key={zone.id} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-900">Critical Density</p>
                      <p className="text-xs text-red-700 mt-1">{zone.name} exceeding safe capacity</p>
                      <div className="flex items-center mt-2 text-xs text-red-600">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Alert active</span>
                      </div>
                    </div>
                  </div>
                ))}
                {criticalZones.length === 0 && (
                  <div className="text-sm text-slate-600 text-center py-4">
                    No active alerts
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Quick Stats</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Total Zones</span>
                <span className="text-sm font-semibold text-slate-900">{zones.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Safe Zones</span>
                <span className="text-sm font-semibold text-slate-900">
                  {zones.filter(z => z.level === 'safe').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Peak Capacity</span>
                <span className="text-sm font-semibold text-slate-900">
                  {Math.max(...zones.map(z => getOccupancyPercentage(z.count, z.capacity)))}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { AlertTriangle, Users, Heart, MapPin, TrendingUp, Clock } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  count: number;
  capacity: number;
  level: 'safe' | 'moderate' | 'risky' | 'critical';
}

export default function Dashboard() {
  const [zones] = useState<Zone[]>([
    { id: '1', name: 'Main Entrance', count: 850, capacity: 1000, level: 'moderate' },
    { id: '2', name: 'Food Court Area', count: 1450, capacity: 1200, level: 'critical' },
    { id: '3', name: 'Stage Front', count: 3200, capacity: 3500, level: 'moderate' },
    { id: '4', name: 'Parking Zone A', count: 520, capacity: 1500, level: 'safe' },
    { id: '5', name: 'Emergency Exit 1', count: 180, capacity: 500, level: 'safe' },
    { id: '6', name: 'Medical Bay', count: 45, capacity: 100, level: 'safe' },
  ]);

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

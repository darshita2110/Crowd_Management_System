import { useState } from 'react';
import { Search, Filter, User, Clock, MapPin, AlertCircle, CheckCircle, PhoneCall } from 'lucide-react';

interface LostPerson {
  id: string;
  missingPersonName: string;
  age: number;
  description: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  reporterName: string;
  reporterContact: string;
  status: 'reported' | 'searching' | 'found' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: string;
}

export default function LostPersons() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<LostPerson | null>(null);

  const [reports] = useState<LostPerson[]>([
    {
      id: '1',
      missingPersonName: 'Emma Johnson',
      age: 7,
      description: 'White t-shirt with blue jeans, brown hair in pigtails, carrying a pink backpack',
      lastSeenLocation: 'Main Entrance',
      lastSeenTime: '14:30',
      reporterName: 'Sarah Johnson',
      reporterContact: '+1 555-0123',
      status: 'searching',
      priority: 'critical',
      reportedAt: '14:42',
    },
    {
      id: '2',
      missingPersonName: 'Michael Chen',
      age: 65,
      description: 'Gray jacket, black pants, wearing glasses, uses walking stick',
      lastSeenLocation: 'Food Court Area',
      lastSeenTime: '15:10',
      reporterName: 'Linda Chen',
      reporterContact: '+1 555-0456',
      status: 'reported',
      priority: 'high',
      reportedAt: '15:25',
    },
    {
      id: '3',
      missingPersonName: 'Alex Rodriguez',
      age: 12,
      description: 'Red hoodie, blue sneakers, short black hair',
      lastSeenLocation: 'Stage Front',
      lastSeenTime: '13:45',
      reporterName: 'Maria Rodriguez',
      reporterContact: '+1 555-0789',
      status: 'found',
      priority: 'high',
      reportedAt: '14:15',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'searching':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'found':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.missingPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: reports.length,
    reported: reports.filter((r) => r.status === 'reported').length,
    searching: reports.filter((r) => r.status === 'searching').length,
    found: reports.filter((r) => r.status === 'found').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lost Person Reports</h1>
          <p className="text-sm text-slate-600 mt-1">Manage and track missing person reports</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Create New Report
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === status
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-sm text-slate-600 mt-1 capitalize">{status === 'all' ? 'Total' : status}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by missing person or reporter name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{report.missingPersonName}</h3>
                      <span className="text-sm text-slate-600">Age {report.age}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <AlertCircle className={`w-4 h-4 ${getPriorityColor(report.priority)}`} />
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{report.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>Last seen: {report.lastSeenLocation}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Time: {report.lastSeenTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <PhoneCall className="w-4 h-4" />
                        <span>Reporter: {report.reporterName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Reported: {report.reportedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {report.status === 'searching' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Found</span>
                    </button>
                  )}
                  <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Missing Person Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Name:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedReport.missingPersonName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Age:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedReport.age} years</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Description:</span>
                    <p className="text-sm text-slate-900 mt-1">{selectedReport.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Last Known Location</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Location:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedReport.lastSeenLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Time:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedReport.lastSeenTime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Reporter Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Name:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedReport.reporterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Contact:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedReport.reporterContact}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Update Status
                </button>
                <button className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  Add Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

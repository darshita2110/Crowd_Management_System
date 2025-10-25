import { useState } from 'react';
import Dashboard from './components/Dashboard';
import LostPersons from './components/LostPersons';
import MedicalEmergencies from './components/MedicalEmergencies';
import EmergencyExits from './components/EmergencyExits';
import FeedbackReports from './components/FeedbackReports';
import { Activity, Users, Heart, DoorOpen, MessageSquare } from 'lucide-react';

type TabType = 'dashboard' | 'lost-persons' | 'medical' | 'exits' | 'feedback';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Crowd Management System</h1>
                <p className="text-xs text-slate-500">Organizer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Live Event
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('lost-persons')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lost-persons'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Lost Persons</span>
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'medical'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Medical</span>
            </button>
            <button
              onClick={() => setActiveTab('exits')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'exits'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Emergency Exits</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback & Reports</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'lost-persons' && <LostPersons />}
        {activeTab === 'medical' && <MedicalEmergencies />}
        {activeTab === 'exits' && <EmergencyExits />}
        {activeTab === 'feedback' && <FeedbackReports />}
      </main>
    </div>
  );
}

export default App;

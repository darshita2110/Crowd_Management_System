import { useState } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, Star, FileText, Download, Calendar, BarChart3 } from 'lucide-react';

interface Feedback {
  id: string;
  attendeeName: string;
  rating: number;
  crowdManagementRating: number;
  safetyRating: number;
  comments: string;
  suggestions: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  submittedAt: string;
}

interface Report {
  id: string;
  reportType: 'post_event_summary' | 'incident_report' | 'ai_analysis' | 'performance_metrics';
  title: string;
  generatedBy: 'ai' | 'system' | 'manual';
  generatedAt: string;
  summary: string;
}

export default function FeedbackReports() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'reports'>('feedback');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const [feedbacks] = useState<Feedback[]>([
    {
      id: '1',
      attendeeName: 'Sarah Johnson',
      rating: 5,
      crowdManagementRating: 5,
      safetyRating: 5,
      comments: 'Excellent crowd management! I felt safe throughout the event. The staff was very responsive.',
      suggestions: 'Maybe add more water stations near the stage area.',
      sentiment: 'positive',
      submittedAt: '2 hours ago',
    },
    {
      id: '2',
      attendeeName: 'Michael Chen',
      rating: 3,
      crowdManagementRating: 3,
      safetyRating: 4,
      comments: 'The main entrance was too crowded. Had to wait 20 minutes to get in.',
      suggestions: 'Open more entrance points during peak hours. Better signage for alternate routes.',
      sentiment: 'neutral',
      submittedAt: '3 hours ago',
    },
    {
      id: '3',
      attendeeName: 'Anonymous',
      rating: 2,
      crowdManagementRating: 2,
      safetyRating: 3,
      comments: 'Food court area was dangerously overcrowded. Could barely move.',
      suggestions: 'Need better crowd control in high-traffic areas. Consider limiting capacity per zone.',
      sentiment: 'negative',
      submittedAt: '4 hours ago',
    },
    {
      id: '4',
      attendeeName: 'Emily Rodriguez',
      rating: 4,
      crowdManagementRating: 4,
      safetyRating: 5,
      comments: 'Overall great experience. Emergency exits were clearly marked and accessible.',
      suggestions: 'More medical staff visibility would be reassuring.',
      sentiment: 'positive',
      submittedAt: '5 hours ago',
    },
  ]);

  const [reports] = useState<Report[]>([
    {
      id: '1',
      reportType: 'ai_analysis',
      title: 'AI Sentiment Analysis - Event Feedback',
      generatedBy: 'ai',
      generatedAt: '1 hour ago',
      summary: '127 feedback responses analyzed. 68% positive, 22% neutral, 10% negative. Key concerns: entrance congestion, food court crowding.',
    },
    {
      id: '2',
      reportType: 'performance_metrics',
      title: 'Crowd Management Performance Metrics',
      generatedBy: 'system',
      generatedAt: '2 hours ago',
      summary: 'Average response time: 3.5 minutes. Peak density reached at 15:30. 3 critical incidents resolved successfully.',
    },
    {
      id: '3',
      reportType: 'incident_report',
      title: 'Medical Incidents Summary',
      generatedBy: 'manual',
      generatedAt: '3 hours ago',
      summary: '4 medical incidents reported. All resolved within acceptable timeframes. 1 transport to hospital (non-critical).',
    },
    {
      id: '4',
      reportType: 'post_event_summary',
      title: 'Daily Event Summary Report',
      generatedBy: 'system',
      generatedAt: '4 hours ago',
      summary: 'Total attendees: 6,320. 3 lost person reports (all resolved). 8 emergency alerts issued. Overall safety rating: 4.2/5.',
    },
  ]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'neutral':
        return 'text-yellow-600 bg-yellow-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'ai_analysis':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'performance_metrics':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'incident_report':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'post_event_summary':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1);
  const avgCrowdRating = (feedbacks.reduce((sum, f) => sum + f.crowdManagementRating, 0) / feedbacks.length).toFixed(1);
  const avgSafetyRating = (feedbacks.reduce((sum, f) => sum + f.safetyRating, 0) / feedbacks.length).toFixed(1);
  const positiveFeedback = feedbacks.filter((f) => f.sentiment === 'positive').length;
  const negativeFeedback = feedbacks.filter((f) => f.sentiment === 'negative').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback & Reports</h1>
          <p className="text-sm text-slate-600 mt-1">Analyze attendee feedback and review AI-generated insights</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Overall Rating</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{avgRating}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+0.3</span>
            <span className="text-slate-500 ml-1">vs last event</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Crowd Management</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{avgCrowdRating}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Out of 5 stars
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Safety Rating</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{avgSafetyRating}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Out of 5 stars
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Feedback</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{feedbacks.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-green-600 font-medium">{positiveFeedback} positive</span>
            <span className="text-slate-400 mx-1">•</span>
            <span className="text-red-600 font-medium">{negativeFeedback} negative</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Attendee Feedback</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>AI Reports & Analytics</span>
            </button>
          </div>
        </div>

        {activeTab === 'feedback' && (
          <div className="divide-y divide-slate-200">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => setSelectedFeedback(feedback)}
                className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {feedback.attendeeName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{feedback.attendeeName}</p>
                      <p className="text-xs text-slate-500">{feedback.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mb-3">{feedback.comments}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Crowd Management:</span>
                    <span className="font-semibold text-slate-900">{feedback.crowdManagementRating}/5</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded">
                    <span className="text-slate-600">Safety:</span>
                    <span className="font-semibold text-slate-900">{feedback.safetyRating}/5</span>
                  </div>
                </div>
                {feedback.suggestions && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Suggestions:</p>
                    <p className="text-sm text-blue-800">{feedback.suggestions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="divide-y divide-slate-200">
            {reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getReportTypeColor(report.reportType)}`}>
                        {report.reportType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{report.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{report.generatedAt}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>Generated by {report.generatedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>View Report</span>
                    </button>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Detailed Feedback</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Attendee Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Name:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedFeedback.attendeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Submitted:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedFeedback.submittedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Sentiment:</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSentimentColor(selectedFeedback.sentiment)}`}>
                      {selectedFeedback.sentiment}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Ratings</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Overall Rating:</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < selectedFeedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-slate-900">{selectedFeedback.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Crowd Management:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedFeedback.crowdManagementRating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Safety:</span>
                    <span className="text-sm font-medium text-slate-900">{selectedFeedback.safetyRating}/5</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Comments</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-900">{selectedFeedback.comments}</p>
                </div>
              </div>

              {selectedFeedback.suggestions && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Suggestions for Improvement</h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-900">{selectedFeedback.suggestions}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

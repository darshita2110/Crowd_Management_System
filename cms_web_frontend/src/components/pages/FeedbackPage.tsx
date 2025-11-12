import { useState, useEffect } from 'react';
import { Star, TrendingUp, BarChart3, MessageSquare, AlertCircle } from 'lucide-react';
import { Event } from '../../types';
import {
  getFeedbackByEvent,
  getEventFeedbackStats,
  getRecentEventFeedback,
  FeedbackResponse,
  FeedbackStatsResponse
} from '../../services/feedbackApi';

interface FeedbackPageProps {
  events: Event[];
}

interface ProcessedStats {
  avgRating: number;
  totalFeedback: number;
  ratingDistribution: Record<number, number>;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export default function FeedbackPage({ events }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [stats, setStats] = useState<ProcessedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      loadFeedbackData();
    } else {
      setFeedback([]);
      setStats(null);
    }
  }, [selectedEvent]);

  const loadFeedbackData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load recent feedback and stats in parallel
      const [recentFeedback, eventStats] = await Promise.all([
        getRecentEventFeedback(selectedEvent, 20),
        getEventFeedbackStats(selectedEvent)
      ]);

      setFeedback(recentFeedback);
      
      // Process stats to match component structure
      const processedStats: ProcessedStats = {
        avgRating: eventStats.average_rating,
        totalFeedback: eventStats.total_count,
        ratingDistribution: {
          1: eventStats.rating_distribution['1_star'],
          2: eventStats.rating_distribution['2_star'],
          3: eventStats.rating_distribution['3_star'],
          4: eventStats.rating_distribution['4_star'],
          5: eventStats.rating_distribution['5_star']
        },
        sentimentDistribution: eventStats.sentiment_distribution
      };

      setStats(processedStats);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setError('Failed to load feedback data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'text-green-400 bg-green-500/20 border-green-400/30',
      neutral: 'text-blue-400 bg-blue-500/20 border-blue-400/30',
      negative: 'text-red-400 bg-red-500/20 border-red-400/30'
    };
    return colors[sentiment] || 'text-gray-400 bg-gray-500/20 border-gray-400/30';
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Feedback Analysis</h1>
      <p className="text-gray-300 mb-8">Analyze user feedback and generate insights</p>

      <div className="mb-8">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      )}

      {!loading && selectedEvent && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-200 text-sm">Overall Rating</p>
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-white">
                  {stats.avgRating.toFixed(1)}
                </p>
                <p className="text-gray-300 mb-1">/ 5.0</p>
              </div>
              {renderStars(Math.round(stats.avgRating))}
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-200 text-sm">Total Responses</p>
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-4xl font-bold text-white">
                {stats.totalFeedback}
              </p>
              <p className="text-gray-300 text-sm mt-1">feedback submissions</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-200 text-sm">Positive Sentiment</p>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-white">
                  {stats.sentimentDistribution.positive}
                </p>
                <p className="text-gray-300 mb-1">
                  ({stats.totalFeedback > 0 
                    ? ((stats.sentimentDistribution.positive / stats.totalFeedback) * 100).toFixed(0)
                    : 0}%)
                </p>
              </div>
              <p className="text-gray-300 text-sm mt-1">positive responses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Sentiment Analysis
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.sentimentDistribution).map(([sentiment, count]) => (
                  <div key={sentiment}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium capitalize ${getSentimentColor(sentiment).split(' ')[0]}`}>
                        {sentiment}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{count}</span>
                        <span className="text-gray-400 text-sm">
                          ({stats.totalFeedback > 0 
                            ? ((count / stats.totalFeedback) * 100).toFixed(0)
                            : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sentiment === 'positive' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : sentiment === 'neutral'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ 
                          width: stats.totalFeedback > 0 
                            ? `${(count / stats.totalFeedback) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-white font-medium w-12">{rating} Star</span>
                    <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: stats.totalFeedback > 0
                            ? `${(stats.ratingDistribution[rating] / stats.totalFeedback) * 100}%`
                            : '0%'
                        }}
                      >
                        {stats.ratingDistribution[rating] > 0 && (
                          <span className="text-xs text-white font-medium">
                            {stats.ratingDistribution[rating]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Recent Feedback</h3>
            {feedback.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No feedback available for this event.</p>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {renderStars(item.rating)}
                        <span className={`text-sm px-2 py-1 rounded-full capitalize ${getSentimentColor(item.ai_sentiment)}`}>
                          {item.ai_sentiment}
                        </span>
                        {item.category && (
                          <span className="text-sm px-2 py-1 rounded-full bg-gray-500/20 text-gray-300 capitalize">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {item.comment && (
                      <p className="text-gray-300 text-sm">{item.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!loading && selectedEvent && !stats && !error && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No feedback data available for this event.</p>
        </div>
      )}
    </div>
  );
}
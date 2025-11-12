import { API_BASE_URL } from '../utils/constants';

export interface FeedbackPayload {
  user_id: string;
  event_id: string;
  rating: number;
  comments?: string;
}

export interface FeedbackResponse {
  event_id: string;
  rating: number;
  category: string;
  comment: string | null;
  id: string;
  user_id: string;
  created_at: string;
  submitted_at: string;
  ai_sentiment: string;
}

export interface FeedbackStatsResponse {
  total_count: number;
  average_rating: number;
  rating_distribution: {
    '5_star': number;
    '4_star': number;
    '3_star': number;
    '2_star': number;
    '1_star': number;
  };
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Submit feedback
export const submitFeedback = async (payload: FeedbackPayload): Promise<FeedbackResponse> => {
  const response = await fetch(`${API_BASE_URL}/feedback/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit feedback');
  }

  return response.json();
};

// Get all feedback
export const getAllFeedback = async (): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/feedback/`);

  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }

  return response.json();
};

// Get feedback by event ID
export const getFeedbackByEvent = async (eventId: string): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/feedback/?event_id=${eventId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch feedback for event');
  }

  return response.json();
};

// Get feedback by user ID
export const getFeedbackByUser = async (userId: string): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/feedback/?user_id=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user feedback');
  }

  return response.json();
};

// Get feedback by minimum rating
export const getFeedbackByMinRating = async (minRating: number): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/feedback/?min_rating=${minRating}`);

  if (!response.ok) {
    throw new Error('Failed to fetch feedback by rating');
  }

  return response.json();
};

// Get feedback by sentiment
export const getFeedbackBySentiment = async (sentiment: 'positive' | 'neutral' | 'negative'): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/feedback/?sentiment=${sentiment}`);

  if (!response.ok) {
    throw new Error('Failed to fetch feedback by sentiment');
  }

  return response.json();
};

// Get single feedback by ID
export const getFeedbackById = async (feedbackId: string): Promise<FeedbackResponse> => {
  const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }

  return response.json();
};

// Get event feedback stats
export const getEventFeedbackStats = async (eventId: string): Promise<FeedbackStatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/feedback/event/${eventId}/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch event stats');
  }

  return response.json();
};

// Get recent feedback for event
export const getRecentEventFeedback = async (eventId: string, limit: number = 10): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/feedback/event/${eventId}/recent?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch recent feedback');
  }

  return response.json();
};
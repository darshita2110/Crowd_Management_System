import { API_BASE_URL } from '../utils/constants';

export interface Area {
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  radius_m: number;
}

export interface EventPayload {
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  organizer_id: string;
  areas?: Area[];
}

export interface EventResponse {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  attendees_count: number;
  areas: Area[];
  date: string | null;
  organizer_id: string;
  status: 'upcoming' | 'live' | 'completed';
  created_at: string;
}

export interface StatusUpdateResponse {
  message: string;
  event_id: string;
  status: string;
}

export interface DeleteResponse {
  message: string;
  event_id: string;
}

// Create a new event
export const createEvent = async (eventData: EventPayload): Promise<EventResponse> => {
  try {
    console.log('Creating event with data:', eventData);
    
    const response = await fetch(`${API_BASE_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    console.log('Response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to create event');
    }

    return data;
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

// Get all events
export const getAllEvents = async (): Promise<EventResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/events/`);

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
};

// Get events by status
export const getEventsByStatus = async (status: 'upcoming' | 'live' | 'completed'): Promise<EventResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/events/?status=${status}`);

  if (!response.ok) {
    throw new Error('Failed to fetch events by status');
  }

  return response.json();
};

// Get events by organizer
export const getEventsByOrganizer = async (organizerId: string): Promise<EventResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/events/?organizer_id=${organizerId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch events by organizer');
  }

  return response.json();
};

// Get a single event by ID
export const getEventById = async (eventId: string): Promise<EventResponse> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }

  return response.json();
};

// Update an event
export const updateEvent = async (eventId: string, eventData: EventPayload): Promise<EventResponse> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error('Failed to update event');
  }

  return response.json();
};

// Update event status
export const updateEventStatus = async (
  eventId: string,
  status: 'live' | 'completed'
): Promise<StatusUpdateResponse> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/status?status=${status}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Failed to update event status');
  }

  return response.json();
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<DeleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete event');
  }

  return response.json();
};
// src/services/eventService.ts
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
    console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    console.log('Response status:', response.status);

    let data;
    try {
      data = await response.json();
      console.log('Response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      const text = await response.text();
      console.error('Response text:', text);
      throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
    }

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || JSON.stringify(data);
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    console.error('Create event error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
};

// Get all events
export const getAllEvents = async (): Promise<EventResponse[]> => {
  try {
    console.log('Fetching all events from:', `${API_BASE_URL}/events/`);
    
    const response = await fetch(`${API_BASE_URL}/events/`);
    
    console.log('Fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch events');
    }

    const data = await response.json();
    console.log('Events fetched successfully:', data.length, 'events');
    return data;
  } catch (error) {
    console.error('Fetch events error:', error);
    throw error;
  }
};

// Get events by status
export const getEventsByStatus = async (status: 'upcoming' | 'live' | 'completed'): Promise<EventResponse[]> => {
  try {
    console.log('Fetching events by status:', status);
    
    const response = await fetch(`${API_BASE_URL}/events/?status=${status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch events by status');
    }

    const data = await response.json();
    console.log(`Events with status '${status}' fetched:`, data.length, 'events');
    return data;
  } catch (error) {
    console.error('Fetch events by status error:', error);
    throw error;
  }
};

// Get events by organizer
export const getEventsByOrganizer = async (organizerId: string): Promise<EventResponse[]> => {
  try {
    console.log('Fetching events by organizer:', organizerId);
    
    const response = await fetch(`${API_BASE_URL}/events/?organizer_id=${organizerId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch events by organizer');
    }

    const data = await response.json();
    console.log(`Events for organizer '${organizerId}' fetched:`, data.length, 'events');
    return data;
  } catch (error) {
    console.error('Fetch events by organizer error:', error);
    throw error;
  }
};

// Get a single event by ID
export const getEventById = async (eventId: string): Promise<EventResponse> => {
  try {
    console.log('Fetching event by ID:', eventId);
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to fetch event');
    }

    const data = await response.json();
    console.log('Event fetched:', data);
    return data;
  } catch (error) {
    console.error('Fetch event by ID error:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (eventId: string, eventData: EventPayload): Promise<EventResponse> => {
  try {
    console.log('Updating event:', eventId, eventData);
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to update event');
    }

    const data = await response.json();
    console.log('Event updated:', data);
    return data;
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

// Update event status
export const updateEventStatus = async (
  eventId: string,
  status: 'live' | 'completed'
): Promise<StatusUpdateResponse> => {
  try {
    console.log('Updating event status:', eventId, 'to', status);
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/status?status=${status}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to update event status');
    }

    const data = await response.json();
    console.log('Event status updated:', data);
    return data;
  } catch (error) {
    console.error('Update event status error:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<DeleteResponse> => {
  try {
    console.log('Deleting event:', eventId);
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || 'Failed to delete event');
    }

    const data = await response.json();
    console.log('Event deleted:', data);
    return data;
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};
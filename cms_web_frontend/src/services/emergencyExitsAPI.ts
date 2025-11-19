import { API_BASE_URL } from '../utils/constants';

export interface EmergencyExit {
  id: string;
  event_id: string;
  exit_name: string;
  location: string;
  status: 'clear' | 'moderate' | 'crowded';
  last_updated: string;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  attendees_count: number;
  areas: any[];
  date: string | null;
  organizer_id: string;
  status: 'upcoming' | 'live' | 'completed';
  created_at: string;
}

export interface CreateEmergencyExitPayload {
  event_id: string;
  exit_name: string;
  location: string;
  status: 'clear' | 'moderate' | 'crowded';
}

export interface UpdateEmergencyExitPayload {
  event_id: string;
  exit_name: string;
  location: string;
  status: 'clear' | 'moderate' | 'crowded';
}

class EmergencyExitsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/emergency-exits`;
  }

  /**
   * Create a new emergency exit
   */
  async createExit(payload: CreateEmergencyExitPayload): Promise<EmergencyExit> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create emergency exit');
    }

    return response.json();
  }

  /**
   * Get all emergency exits for an event
   */
  async getExitsByEvent(eventId: string): Promise<EmergencyExit[]> {
    const response = await fetch(`${this.baseUrl}/?event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch emergency exits');
    }

    return response.json();
  }

  /**
   * Get a specific emergency exit by ID
   */
  async getExitById(exitId: string): Promise<EmergencyExit> {
    const response = await fetch(`${this.baseUrl}/${exitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch emergency exit');
    }

    return response.json();
  }

  /**
   * Update an emergency exit
   */
  async updateExit(exitId: string, payload: UpdateEmergencyExitPayload): Promise<EmergencyExit> {
    const response = await fetch(`${this.baseUrl}/${exitId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update emergency exit');
    }

    return response.json();
  }

  /**
   * Update only the status of an emergency exit
   */
  async updateExitStatus(
    exitId: string,
    status: 'clear' | 'moderate' | 'crowded'
  ): Promise<EmergencyExit> {
    const response = await fetch(`${this.baseUrl}/${exitId}/status?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update exit status');
    }

    return response.json();
  }

  /**
   * Delete an emergency exit
   */
  async deleteExit(exitId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${exitId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete emergency exit');
    }
  }

  /**
   * Get all events
   */
  async getAllEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch events');
    }

    return response.json();
  }
}

export const emergencyExitsAPI = new EmergencyExitsAPI();
// src/services/lostPersonsService.ts
import { API_BASE_URL } from '../utils/constants';

export interface LostPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  last_seen_location: string;
  last_seen_time: string;
  photo_url: string | null;
  reporter_id: string;
  reporter_name: string;
  reporter_phone: string;
  reporter_contact: string;
  event_id: string;
  status: 'missing' | 'searching' | 'found' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  reported_at: string;
  created_at: string;
}

export interface LostPersonStats {
  total: number;
  by_status: {
    reported: number;
    searching: number;
    found: number;
    resolved: number;
  };
  by_priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface CreateLostPersonPayload {
  reporter_id: string;
  reporter_name: string;
  age: number;
  gender: string;
  description: string;
  last_seen_location: string;
  last_seen_time: string;
  event_id: string;
  name: string;
  reporter_phone: string;
}

class LostPersonsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/lost-persons`;
  }

  // Create a new lost person report
  async createReport(payload: CreateLostPersonPayload): Promise<LostPerson> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create lost person report');
    }

    return response.json();
  }

  // Get all lost persons
  async getAllReports(): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch lost persons');
    }

    return response.json();
  }

  // Get lost persons by event ID
  async getReportsByEvent(eventId: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/?event_id=${eventId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch lost persons by event');
    }

    return response.json();
  }

  // Get lost persons by status
  async getReportsByStatus(status: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/?status=${status}`);

    if (!response.ok) {
      throw new Error('Failed to fetch lost persons by status');
    }

    return response.json();
  }

  // Get lost persons by priority
  async getReportsByPriority(priority: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/?priority=${priority}`);

    if (!response.ok) {
      throw new Error('Failed to fetch lost persons by priority');
    }

    return response.json();
  }

  // Get a specific report by ID
  async getReportById(reportId: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/${reportId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch lost person report');
    }

    return response.json();
  }

  // Update report status
  async updateStatus(reportId: string, newStatus: 'searching' | 'found' | 'resolved'): Promise<LostPerson> {
    const response = await fetch(`${this.baseUrl}/${reportId}/status?new_status=${newStatus}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to update report status');
    }

    return response.json();
  }

  // Get active search cases for an event
  async getActiveSearches(eventId: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/search/active?event_id=${eventId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch active searches');
    }

    return response.json();
  }

  // Get event statistics
  async getEventStats(eventId: string): Promise<LostPersonStats> {
    const response = await fetch(`${this.baseUrl}/stats/event/${eventId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch event statistics');
    }

    return response.json();
  }

  // Upload photo for a report
  async uploadPhoto(reportId: string, file: File): Promise<LostPerson> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/${reportId}/photo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  }

  // Delete photo from a report
  async deletePhoto(reportId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${reportId}/photo`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete photo');
    }
  }
}

export const lostPersonsService = new LostPersonsService();
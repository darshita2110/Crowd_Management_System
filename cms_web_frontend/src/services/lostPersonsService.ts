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

export interface PhotoUploadResponse {
  message: string;
  photo_url: string;
  filename: string;
}

class LostPersonsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/lost-persons`;
  }

  // API 1 & 2: Create a new lost person report (POST /lost-persons/)
  async createReport(payload: CreateLostPersonPayload): Promise<LostPerson> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create report' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 3: Get all lost person reports (GET /lost-persons/)
  async getAllReports(): Promise<LostPerson[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 4: Get reports by event (GET /lost-persons/?event_id={{event_id}})
  async getReportsByEvent(eventId: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}?event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 5: Get reports by status (GET /lost-persons/?status=searching)
  async getReportsByStatus(status: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 6: Get reports by priority (GET /lost-persons/?priority=critical)
  async getReportsByPriority(priority: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}?priority=${priority}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 7: Get single report by ID (GET /lost-persons/{{report_id}})
  async getReportById(reportId: string): Promise<LostPerson> {
    const response = await fetch(`${this.baseUrl}/${reportId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 8 & 9: Update status (PATCH /lost-persons/{{report_id}}/status?new_status=searching)
  async updateStatus(
    reportId: string,
    newStatus: 'searching' | 'found' | 'resolved'
  ): Promise<LostPerson> {
    const response = await fetch(`${this.baseUrl}/${reportId}/status?new_status=${newStatus}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update status' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 10: Get active reports (GET /lost-persons/search/active?event_id={{event_id}})
  async getActiveReports(eventId: string): Promise<LostPerson[]> {
    const response = await fetch(`${this.baseUrl}/search/active?event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 11: Get event statistics (GET /lost-persons/stats/event/{{event_id}})
  async getEventStats(eventId: string): Promise<LostPersonStats> {
    const response = await fetch(`${this.baseUrl}/stats/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 12: Upload photo (POST /lost-persons/{{report_id}}/photo)
  async uploadPhoto(reportId: string, file: File): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/${reportId}/photo`, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - browser will set it automatically with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload photo' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // API 13: Delete photo (DELETE /lost-persons/{{report_id}}/photo)
  async deletePhoto(reportId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${reportId}/photo`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete photo' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Helper method to get full photo URL
  getPhotoUrl(photoPath: string | null): string | null {
    if (!photoPath) return null;
    // If the path already includes the full URL, return it
    if (photoPath.startsWith('http')) return photoPath;
    // Otherwise, prepend the base URL (without /lost-persons)
    // Remove any leading slash from photoPath to avoid double slashes
    const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `${API_BASE_URL}${cleanPath}`;
  }

  // Check if photo exists (optional - use for validation)
  async checkPhotoExists(photoUrl: string): Promise<boolean> {
    try {
      const response = await fetch(photoUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}



export const lostPersonsService = new LostPersonsService();
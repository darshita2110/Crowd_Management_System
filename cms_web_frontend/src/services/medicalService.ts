// src/services/medicalService.ts
import { API_BASE_URL } from '../utils/constants';

export interface MedicalFacility {
  id?: string;
  event_id: string;
  facility_name: string;
  facility_type: 'hospital' | 'clinic' | 'first-aid';
  contact_number: string;
  address: string;
  created_at?: string;
}

export interface CreateMedicalFacilityPayload {
  event_id: string;
  facility_name: string;
  facility_type: 'hospital' | 'clinic' | 'first-aid';
  contact_number: string;
  address: string;
}

class MedicalService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/medical-facilities`;
  }

  /**
   * Create a new medical facility
   * POST /medical-facilities/
   */
  async createFacility(payload: CreateMedicalFacilityPayload): Promise<MedicalFacility> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create facility: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all medical facilities for an event
   * GET /medical-facilities/?event_id={{event_id}}
   */
  async getFacilitiesByEvent(eventId: string): Promise<MedicalFacility[]> {
    const response = await fetch(`${this.baseUrl}/?event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all medical facilities (no event filter)
   * GET /medical-facilities/
   */
  async getAllFacilities(): Promise<MedicalFacility[]> {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all facilities: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a specific facility by ID
   * GET /medical-facilities/{{facility_id}}
   * Note: Based on API response, this seems to return all facilities, not just one
   */
  async getFacilityById(facilityId: string): Promise<MedicalFacility[]> {
    const response = await fetch(`${this.baseUrl}/${facilityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch facility: ${response.statusText}`);
    }

    return response.json();
  }
}

export const medicalService = new MedicalService();
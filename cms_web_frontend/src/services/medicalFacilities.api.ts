import { API_BASE_URL } from '../utils/constants';

// Types for API requests
export interface CreateMedicalFacilityRequest {
  event_id: string;
  facility_name: string;
  facility_type: 'hospital' | 'clinic' | 'first-aid';
  contact_number: string;
  address?: string;
}

export interface MedicalFacilityResponse {
  event_id: string;
  facility_name: string;
  facility_type: 'hospital' | 'clinic' | 'first-aid';
  contact_number: string;
  address: string;
  id: string;
  created_at: string;
}

// API Service Class
class MedicalFacilitiesAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/medical-facilities`;
  }

  /**
   * Get all medical facilities for a specific event
   * GET /medical-facilities/?event_id={{event_id}}
   */
  async getFacilitiesByEvent(eventId: string): Promise<MedicalFacilityResponse[]> {
    try {
      console.log('Fetching facilities for event:', eventId);
      
      const response = await fetch(`${this.baseUrl}/?event_id=${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Facilities response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch facilities: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Facilities fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching medical facilities:', error);
      throw error;
    }
  }

  /**
   * Get a specific medical facility by ID
   * GET /medical-facilities/{{facility_id}}
   * Note: Based on API response, this returns an array of all facilities
   */
  async getFacilityById(facilityId: string): Promise<MedicalFacilityResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${facilityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch facility: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching medical facility:', error);
      throw error;
    }
  }

  /**
   * Create a new medical facility
   * POST /medical-facilities/
   */
  async createFacility(
    facilityData: CreateMedicalFacilityRequest
  ): Promise<MedicalFacilityResponse> {
    try {
      console.log('Creating facility with data:', facilityData);
      
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facilityData),
      });

      console.log('Create facility response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || `Failed to create facility: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Facility created:', data);
      return data;
    } catch (error) {
      console.error('Error creating medical facility:', error);
      throw error;
    }
  }

  /**
   * Update a medical facility
   * PUT /medical-facilities/{{facility_id}}
   * Note: Currently returns "Method Not Allowed" - implement when backend supports it
   */
  async updateFacility(
    facilityId: string,
    facilityData: Partial<CreateMedicalFacilityRequest>
  ): Promise<MedicalFacilityResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${facilityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facilityData),
      });

      if (!response.ok) {
        if (response.status === 405) {
          throw new Error('Update operation is not supported by the API');
        }
        throw new Error(`Failed to update facility: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating medical facility:', error);
      throw error;
    }
  }

  /**
   * Delete a medical facility
   * DELETE /medical-facilities/{{facility_id}}
   * Note: Currently returns "Method Not Allowed" - implement when backend supports it
   */
  async deleteFacility(facilityId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${facilityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 405) {
          throw new Error('Delete operation is not supported by the API');
        }
        throw new Error(`Failed to delete facility: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting medical facility:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const medicalFacilitiesAPI = new MedicalFacilitiesAPI();

// Export default for convenience
export default medicalFacilitiesAPI;
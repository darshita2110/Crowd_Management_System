// src/services/washroomService.ts
import { API_BASE_URL } from '../utils/constants';

export interface WashroomFacility {
  id: string;
  event_id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  floor_level: string | null;
  capacity: number;
  availability_status: 'available' | 'occupied' | 'maintenance';
  location_details: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWashroomPayload {
  event_id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  floor_level?: string | null;
  capacity: number;
  availability_status?: 'available' | 'occupied' | 'maintenance';
  location_details?: string | null;
}

class WashroomService {
  private baseUrl: string;

  constructor() {
    // Ensure no double slashes in URL
    this.baseUrl = `${API_BASE_URL}/washroom-facilities`;
    console.log('🔧 WashroomService initialized with baseUrl:', this.baseUrl);
  }

  // Create washroom facility
  async createWashroom(payload: CreateWashroomPayload): Promise<WashroomFacility> {
    const url = `${this.baseUrl}/`;
    console.log('🚀 Creating washroom');
    console.log('📍 URL:', url);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });

      const responseText = await response.text();
      console.log('📄 Raw Response:', responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          console.error('❌ Error Data:', errorData);
          errorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
        } catch (e) {
          console.error('❌ Could not parse error response');
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('✅ Washroom created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('💥 Error creating washroom:', error);
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      
      // Check for common network errors
      if (error.message.includes('Failed to fetch')) {
        console.error('🔴 Network Error - Possible issues:');
        console.error('  1. Backend server is not running');
        console.error('  2. CORS is not configured properly');
        console.error('  3. Wrong API_BASE_URL in constants.ts');
        console.error('  Current baseUrl:', this.baseUrl);
      }
      
      throw error;
    }
  }

  // Get all washrooms for an event
  async getWashroomsByEvent(eventId: string): Promise<WashroomFacility[]> {
    const url = `${this.baseUrl}/?event_id=${encodeURIComponent(eventId)}`;
    console.log('🔍 Fetching washrooms for event:', eventId);
    console.log('📍 URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response:', errorText);
        
        let errorMessage = `Failed to fetch washrooms: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Fetched', data.length, 'washrooms');
      return data;
    } catch (error: any) {
      console.error('💥 Error fetching washrooms:', error);
      throw error;
    }
  }

  // Get single washroom by ID
  async getWashroomById(washroomId: string): Promise<WashroomFacility> {
    const url = `${this.baseUrl}/${washroomId}`;
    console.log('🔍 Fetching washroom:', washroomId);
    console.log('📍 URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch washroom: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching washroom:', error);
      throw error;
    }
  }

  // Update washroom facility
  async updateWashroom(
    washroomId: string,
    payload: CreateWashroomPayload
  ): Promise<WashroomFacility> {
    const url = `${this.baseUrl}/${washroomId}`;
    console.log('🔄 Updating washroom:', washroomId);
    console.log('📍 URL:', url);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response:', errorText);
        
        let errorMessage = `Failed to update washroom: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Washroom updated successfully');
      return data;
    } catch (error: any) {
      console.error('💥 Error updating washroom:', error);
      throw error;
    }
  }

  // Update washroom status
  async updateWashroomStatus(
    washroomId: string,
    status: 'available' | 'occupied' | 'maintenance'
  ): Promise<WashroomFacility> {
    const url = `${this.baseUrl}/${washroomId}/status?status=${status}`;
    console.log('🔄 Updating status to:', status);
    console.log('📍 URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response:', errorText);
        
        let errorMessage = `Failed to update status: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Status updated successfully');
      return data;
    } catch (error: any) {
      console.error('💥 Error updating status:', error);
      throw error;
    }
  }

  // Delete washroom
  async deleteWashroom(washroomId: string): Promise<void> {
    const url = `${this.baseUrl}/${washroomId}`;
    console.log('🗑️ Deleting washroom:', washroomId);
    console.log('📍 URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response:', errorText);
        
        let errorMessage = `Failed to delete washroom: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      console.log('✅ Washroom deleted successfully');
    } catch (error: any) {
      console.error('💥 Error deleting washroom:', error);
      throw error;
    }
  }
}

export const washroomService = new WashroomService();
import { API_BASE_URL } from '../utils/constants';
import { WashroomFacility } from '../types';

// API response type for washroom facility
interface WashroomApiResponse {
  event_id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  floor_level: string | null;
  capacity: number;
  availability_status: 'available' | 'occupied' | 'maintenance';
  location_details: string | null;
  id: string;
  created_at: string;
  updated_at: string;
}

// Create a new washroom facility
export const createWashroom = async (
  eventId: string,
  data: {
    name: string;
    gender: 'male' | 'female' | 'unisex';
    floor_level: string;
    capacity: number;
    availability_status: 'available' | 'occupied' | 'maintenance';
    location_details: string;
  }
): Promise<WashroomApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/washroom-facilities/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_id: eventId,
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create washroom');
  }

  return response.json();
};

// Get all washroom facilities for an event
export const getWashroomsByEvent = async (
  eventId: string
): Promise<WashroomApiResponse[]> => {
  const response = await fetch(
    `${API_BASE_URL}/washroom-facilities/?event_id=${eventId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch washrooms');
  }

  return response.json();
};

// Get a specific washroom facility by ID
// Note: Based on API3, this endpoint returns an array, not a single object
export const getWashroomById = async (
  washroomId: string
): Promise<WashroomApiResponse[]> => {
  const response = await fetch(
    `${API_BASE_URL}/washroom-facilities/${washroomId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch washroom');
  }

  return response.json();
};

// Update washroom status
export const updateWashroomStatus = async (
  washroomId: string,
  status: 'available' | 'occupied' | 'maintenance'
): Promise<WashroomApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/washroom-facilities/${washroomId}/status?status=${status}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update washroom status');
  }

  return response.json();
};

// Note: PUT and DELETE methods return "Method Not Allowed" based on your API tests
// If you need to update full washroom details or delete washrooms,
// you'll need to implement those endpoints on the backend first
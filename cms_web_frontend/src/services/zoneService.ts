export interface Zone {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  current_density: number;
  density_status: 'low' | 'moderate' | 'crowded';
  image_url: string | null;
  last_updated: string;
  created_at: string;
}

export interface CreateZoneData {
  event_id: string;
  name: string;
  capacity: number;
  image_url?: string | null;
}

export interface UpdateZoneData {
  event_id: string;
  name: string;
  capacity: number;
  current_density: number;
  density_status: 'low' | 'moderate' | 'crowded';
  image_url?: string | null;
}

export interface CountResponse {
  image_filename: string;
  person_count: number;
}

// You should import API_BASE_URL from your constants file
// For now, replace this with your actual base URL or import it properly
const API_BASE_URL = 'http://localhost:8000'; // Replace with your backend URL

export const zoneService = {
  // Get all zones for an event
  async getZonesByEvent(eventId: string): Promise<Zone[]> {
    const response = await fetch(`${API_BASE_URL}/zones/?event_id=${eventId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch zones');
    }
    return response.json();
  },

  // Get a single zone by ID
  async getZoneById(zoneId: string): Promise<Zone> {
    const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch zone');
    }
    return response.json();
  },

  // Create a new zone
  async createZone(data: CreateZoneData): Promise<Zone> {
    const response = await fetch(`${API_BASE_URL}/zones/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        current_density: 0,
        density_status: 'low',
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create zone');
    }
    return response.json();
  },

  // Update a zone
  async updateZone(zoneId: string, data: UpdateZoneData): Promise<Zone> {
    const response = await fetch(`${API_BASE_URL}/zones/${zoneId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update zone');
    }
    return response.json();
  },

  // Update zone density
  async updateZoneDensity(zoneId: string, currentDensity: number): Promise<Zone> {
    const response = await fetch(
      `${API_BASE_URL}/zones/${zoneId}/density?current_density=${currentDensity}`,
      {
        method: 'PATCH',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update zone density');
    }
    return response.json();
  },

  // Count people in image using AI
  async countPeopleInImage(imageFile: File): Promise<CountResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/inference/count`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to count people in image');
    }
    return response.json();
  },

  // Helper to calculate density status
  calculateDensityStatus(currentDensity: number, capacity: number): 'low' | 'moderate' | 'crowded' {
    const percentage = (currentDensity / capacity) * 100;
    if (percentage >= 80) return 'crowded';
    if (percentage >= 50) return 'moderate';
    return 'low';
  },
};

export default zoneService;
// Communication with DAW controller
// Uses structure: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO

import { DawDTO, ConfigDTO } from '../dtos/types';

const API_BASE_URL = 'http://localhost:8080/api'; // update with API URL

// Gets a DAW by ID including configs, components, and settings
export const dawAPI = {

  constructor() {},

  getDawById: async (dawId: string): Promise<DawDTO> => {
    try {
      console.log('GET DAW - Loading from backend');
      console.log('URL:', `${API_BASE_URL}/search/daw?dawId=${dawId}`);
      
      const response = await fetch(`${API_BASE_URL}/search/daw?dawId=${dawId}`);
      
      if (!response.ok) {
        console.error('GET DAW - Response error:', response.status, response.statusText);
        throw new Error(`Failed to load DAW: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('GET DAW - Received from backend');
      console.log('Response (DTO):', responseData);
      console.log('Response structure:', {
        dawId: responseData.dawId,
        userId: responseData.userId,
        name: responseData.name,
        configCount: responseData.listOfConfigs?.length || 0,
        firstConfigComponents: responseData.listOfConfigs?.[0]?.components?.length || 0,
        firstConfigName: responseData.listOfConfigs?.[0]?.name
      });
      
      return responseData;
    } catch (error) {
      console.error('GET DAW - Error:', error);
      throw error;
    }
  },

  // Get all DAWs
  getAllDaws: async (): Promise<DawDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/allDaws`);
      
      if (!response.ok) {
        throw new Error(`Failed to load DAWs: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(data);
      console.log('Fetched all DAWs successfully');
      return data;
    } catch (error) {
      console.error('Error loading DAWs:', error);
      throw error;
    }
  },

  // Save DAW config (requires POST endpoint in backend)
  saveDaw: async (daw: DawDTO): Promise<DawDTO> => {
    try {
      const requestBody = JSON.stringify(daw);
      console.log('SAVE DAW - Sending to backend');
      console.log('URL:', `${API_BASE_URL}/save/Daw`);
      console.log('Method: POST');
      console.log('Request Body (DTO):', JSON.parse(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/save/Daw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('SAVE DAW - Response error:', response.status, response.statusText);
        console.error('Error body:', errorText);
        throw new Error(`Failed to save DAW: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('SAVE DAW - Received from backend');
      console.log('Response (DTO):', responseData);
      console.log('Response structure:', {
        dawId: responseData.dawId,
        userId: responseData.userId,
        name: responseData.name,
        configCount: responseData.listOfConfigs?.length || 0,
        firstConfigComponents: responseData.listOfConfigs?.[0]?.components?.length || 0
      });
      
      return responseData;
    } catch (error) {
      console.error('SAVE DAW - Error:', error);
      throw error;
    }
  },

  // Update existing DAW (requires PUT endpoint in backend)
  updateDaw: async (daw: DawDTO): Promise<DawDTO> => {
    try {
      const requestBody = JSON.stringify(daw);
      console.log('UPDATE DAW - Sending to backend');
      console.log('URL:', `${API_BASE_URL}/${daw.dawId}`);
      console.log('Method: PUT');
      console.log('Request Body (DTO):', JSON.parse(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/${daw.dawId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('UPDATE DAW - Response error:', response.status, response.statusText);
        console.error('Error body:', errorText);
        throw new Error(`Failed to update DAW: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('UPDATE DAW - Received from backend');
      console.log('Response (DTO):', responseData);
      console.log('Response structure:', {
        dawId: responseData.dawId,
        userId: responseData.userId,
        name: responseData.name,
        configCount: responseData.listOfConfigs?.length || 0,
        firstConfigComponents: responseData.listOfConfigs?.[0]?.components?.length || 0
      });
      
      return responseData;
    } catch (error) {
      console.error('UPDATE DAW - Error:', error);
      throw error;
    }
  }
}


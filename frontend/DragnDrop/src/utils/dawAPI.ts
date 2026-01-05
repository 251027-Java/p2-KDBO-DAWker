// comms w daw controller
// uses struct: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO

import { DawDTO, ConfigDTO } from '../dtos/types';

const API_BASE_URL = 'http://localhost:8080/api'; // update with API URL

// gets a DAW by ID (configs, components, settings)
export const dawAPI = {

  constructor() {},

  getDawById: async (dawId: string): Promise<DawDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/daw?dawId=${dawId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load DAW: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading DAW:', error);
      throw error;
    }
  },

  // get all daws
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

  // save config (NEEDS POST/PUT ENDPOINTS IN BACKEND TO WORK)
  saveDaw: async (daw: DawDTO): Promise<DawDTO> => {
    try {
      // update endpoint when backend implements POST/PUT
      const response = await fetch(`${API_BASE_URL}/save/Daw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(daw),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save DAW: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving DAW:', error);
      throw error;
    }
  },

  // update existing daw (NEEDS PUT ENDPOINT IN BACKEND TO WORK)
  updateDaw: async (daw: DawDTO): Promise<DawDTO> => {
    try {
      // TODO: Update endpoint when backend implements PUT
      const response = await fetch(`${API_BASE_URL}/${daw.dawId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(daw),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update DAW: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating DAW:', error);
      throw error;
    }
  }
}


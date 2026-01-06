// comms w daw controller
// uses struct: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO

import { forumPageDTO, forumPagePostDTO, forumsDTO, userDTO } from '../dtos/types';

const API_BASE_URL = 'http://localhost:8080/api'; // update with API URL

// gets a DAW by ID (configs, components, settings)
export const forumAPI = {

  constructor() {},

  getForumById: async (userId: number): Promise<forumPageDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/Forums?Id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load Forum: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading Forum:', error);
      throw error;
    }
  },

  // get all daws
  getAllForums: async (): Promise<forumsDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/allForums`);
      
      if (!response.ok) {
        throw new Error(`Failed to load Forums: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(data);
      console.log('Fetched all Forums successfully');
      return data;
    } catch (error) {
      console.error('Error loading Forums:', error);
      throw error;
    }
  },

// inside class UserApiService...

  saveForumPost: async (post: forumPagePostDTO): Promise<forumPagePostDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/saveForum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error(`Failed to save post: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving forum post:', error);
      throw error;
    }
  }

}


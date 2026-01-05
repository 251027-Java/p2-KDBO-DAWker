// comms w daw controller
// uses struct: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO

import { forumPageDTO, forumPagePostDTO, forumsDTO, ratingsCommentPostDTO, RatingsPageDTO, userDTO } from '../dtos/types';

const API_BASE_URL = 'http://localhost:8080/api'; // update with API URL

// gets a DAW by ID (configs, components, settings)
export const ratingsAPI = {

  constructor() {},

  getRatingsPageByDawId: async (dawId: String): Promise<RatingsPageDTO> => {
    
    console.log("This should be where the dawID gets to")
    console.log("dawId: " + dawId)
    try {
      const response = await fetch(`${API_BASE_URL}/search/ratingsPage?dawId=${dawId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ratings: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading ratings:', error);
      throw error;
    }
  },

    createRatingsPage: async (commentData: ratingsCommentPostDTO): Promise<RatingsPageDTO> => {
        
        console.log("did it reach here?")
        console.log(commentData)
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/create`, {
            method: 'POST', // 1. Must specify POST
            headers: {
                'Content-Type': 'application/json', // 2. Tell the server to expect JSON
            },
                // 3. Convert the TypeScript object into a JSON string
                body: JSON.stringify(commentData), 
            });

            if (!response.ok) {
                // Improved error handling to show what actually happened
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server responded with ${response.status}`);
            }

            // 4. Return the RatingsPageDTO sent back by the backend
            return await response.json(); 
        } catch (error) {
            console.error('Error creating Ratings page:', error);
            throw error;
        }
    },

    // Endpoint for this is not created yet.
    updateRatingsPage: async (commentData: ratingsCommentPostDTO): Promise<forumPageDTO> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/update`, {
            method: 'POST', // 1. Must specify POST
            headers: {
                'Content-Type': 'application/json', // 2. Tell the server to expect JSON
            },
                // 3. Convert the TypeScript object into a JSON string
                body: JSON.stringify(commentData), 
            });

            if (!response.ok) {
                // Improved error handling to show what actually happened
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server responded with ${response.status}`);
            }

            // 4. Return the RatingsPageDTO sent back by the backend
            return await response.json(); 
        } catch (error) {
            console.error('Error creating Ratings page:', error);
            throw error;
        }
  },



}


import { recievedSessionNoteDTO, SessionNotePostDTO } from "../dtos/types";

const API_BASE_URL = 'http://localhost:8080/api'; // update with API URL

// gets a DAW by ID (configs, components, settings)
export const notesApi = {

  constructor() {},

  getNoteById: async (noteId: number): Promise<recievedSessionNoteDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/note?Id=${noteId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load not: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading note:', error);
      throw error;
    }
  },

  getNotesByUserId: async (noteId: number): Promise<recievedSessionNoteDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/note/User?Id=${noteId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load not: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error loading note:', error);
      throw error;
    }
  },

  // save config (NEEDS POST/PUT ENDPOINTS IN BACKEND TO WORK)
  saveNote: async (note: SessionNotePostDTO): Promise<recievedSessionNoteDTO> => {
    try {
      // update endpoint when backend implements POST/PUT
      const response = await fetch(`${API_BASE_URL}/notes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save note: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  }
}
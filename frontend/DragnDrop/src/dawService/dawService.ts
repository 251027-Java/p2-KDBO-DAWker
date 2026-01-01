import { DawDTO } from '../dtos/types';
import axios from 'axios';
const API_URL = 'http://localhost:8080/api';

export const dawService = {

    // Get a full DAW project by ID
    getDawById: async (id: string): Promise<DawDTO> => {
        const response = await axios.get(`${API_URL}/search/daw`, {
            params: { 
                dawId: id 
            }
        });
        return response.data;
    },

    // Save a new DAW or update an existing one
    saveDaw: async (daw: DawDTO): Promise<DawDTO> => {
        const response = await axios.post(API_URL, daw);
        return response.data;
    },


};
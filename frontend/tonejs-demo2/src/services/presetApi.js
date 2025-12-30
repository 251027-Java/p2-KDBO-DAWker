/**
 * API service for managing presets with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Save a preset to the backend
 * @param {Object} presetData - The preset DTO object matching backend PresetDTO structure
 * @returns {Promise<Object>} The saved preset data
 */
export const savePreset = async (presetData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to save preset: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving preset:', error);
    throw error;
  }
};

/**
 * Get a preset by ID from the backend
 * @param {number} presetId - The ID of the preset to retrieve
 * @returns {Promise<Object>} The preset data
 */
export const getPreset = async (presetId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/presets/${presetId}`);

    if (!response.ok) {
      throw new Error(`Failed to get preset: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting preset:', error);
    throw error;
  }
};

/**
 * Get all presets for the current user
 * @returns {Promise<Array>} Array of preset objects
 */
export const getAllPresets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/presets`);

    if (!response.ok) {
      throw new Error(`Failed to get presets: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting presets:', error);
    throw error;
  }
};

/**
 * Update an existing preset
 * @param {number} presetId - The ID of the preset to update
 * @param {Object} presetData - The updated preset DTO object
 * @returns {Promise<Object>} The updated preset data
 */
export const updatePreset = async (presetId, presetData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to update preset: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating preset:', error);
    throw error;
  }
};


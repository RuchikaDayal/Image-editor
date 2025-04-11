import axios from 'axios';
import { API_KEY, API_URL } from '../config';

export const searchImages = async (query) => {
  try {
    const response = await axios.get(
      `${API_URL}?query=${query}`,
      {
        headers: {
          Authorization: API_KEY
        }
      }
    );
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    return response.data.photos;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};



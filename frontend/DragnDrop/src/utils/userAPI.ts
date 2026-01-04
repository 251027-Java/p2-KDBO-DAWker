// comms w daw controller
// uses struct: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO
import { commentsPostDTO, userDTO } from '../dtos/types';

const API_BASE_URL = 'http://localhost:8080/api';

class UserApiService {
  // 1. Private field to store the user (Memory Cache)
  private _currentUser: userDTO | null = null;

  constructor() {}

  // 2. Getter to easily access the cached user
  public get currentUser(): userDTO | null {
    return this._currentUser;
  }

  // 3. Setter if you ever need to manually update it
  public set currentUser(user: userDTO | null) {
    this._currentUser = user;
  }

  getUserById = async (userId: number): Promise<userDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/User?Id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load user: ${response.statusText}`);
      }
      
      const user = await response.json();

      // 4. Save the user object internally after fetching
      this._currentUser = user; 
      
      return user;
    } catch (error) {
      console.error('Error loading user:', error);
      throw error;
    }
  }

  getAllUsers = async (): Promise<userDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/allUsers`);
      if (!response.ok) throw new Error(`Failed to load Users`);

      return await response.json();
    } catch (error) {
      console.error('Error loading Users:', error);
      throw error;
    }
  }

    saveComment = async (post: commentsPostDTO): Promise<commentsPostDTO> => {
      try {
        const response = await fetch(`${API_BASE_URL}/saveComment`, {
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

// Export a single instance of the class
export const userAPI = new UserApiService();


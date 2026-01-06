// comms w daw controller
// uses struct: DawDTO -> ConfigDTO -> ComponentDTO -> SettingsDTO
import { commentsPostDTO, userDTO } from '../dtos/types';

const API_BASE_URL = 'http://localhost:8080/api';

class UserApiService {
  // 1. Private field to store the user (Memory Cache)
  private _currentUser: userDTO | null = null;
  private readonly STORAGE_KEY = 'dawker_session_user';

  constructor() {
    const savedSession = localStorage.getItem(this.STORAGE_KEY);
      if (savedSession) {
        try {
          this._currentUser = JSON.parse(savedSession);
        } catch (e) {
          console.error("Failed to parse stored session", e);
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
  }
  

  // 2. Getter to easily access the cached user
  public get currentUser(): userDTO | null {
    return this._currentUser;
  }

  // 3. Setter if you ever need to manually update it
  public set currentUser(user: userDTO | null) {
    this._currentUser = user;
  }

  // Login your user
  // create local storage retrievel for a session
  // Return null if the user does not exist.
  login = async(userEmail: string, userPassword: string): Promise<userDTO | null> => {

    const params = new URLSearchParams({
      email: userEmail,
      passoword: userPassword
    })

    try{

      console.log("Did it get here?")
      console.log(userEmail)
      console.log(userPassword)
    
      const response = await fetch(`${API_BASE_URL}/User/auth`, {
        method: 'POST', // Explicitly set the method
        headers: {
          'Content-Type': 'application/json' // Tell Spring we are sending JSON
        },
        body: JSON.stringify({
          email: userEmail,
          userPassword: userPassword
        })
      });
      console.log(response)

      if (response.status === 404 || response.status === 401) {
        console.warn("User not found or invalid credentials");
        return null; 
      }

      if(!response.ok){
        throw new Error(`Could not get response from server: ${response.statusText}`)
      }

      const loggedIn = await response.json();

      if(loggedIn){

        this._currentUser = loggedIn

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loggedIn))

        return loggedIn;
      }
      return loggedIn;
      
    } catch(error){
      console.error(`Error loading user: ${error}`)
      throw error
    }
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


// 4. The Top-Level DAW State. What is sent out on search
export interface DawDTO {
  dawId: string;
  userId: number;
  description?: string;
  name: string;
  exportCount: number;
  createdAt: Date;
  listOfConfigs: ConfigDTO[];
}

// 3. The saved list of configurations within a DAW
export interface ConfigDTO {
  dawId?: string;
  id: string;
  name: string;
  components: ComponentDTO[];
}

// 2. The Individual components within the chain. 
// Order is important here as you decide how the audio signal flows
export interface ComponentDTO {
  id?: number;
  configId: number
  instanceId: string; // You can have many of one component, they should have unique ids within the chain
  name: string;
  type: 'filter' | 'reverb' | 'distortion' | 'delay'; // Literal types prevent typos
  settings: SettingsDTO;
}

// 1. The Dynamic Settings
// Allows you to store different types of parameters. 
// Type is for which technology is being used within the given setting.
// export_names are to help decide what Device within RNBO you are working with
// Basically, individual settings for each component
export interface SettingsDTO {
    id?: number;
    Technology: 'RNBO' | 'TONEJS';
    export_name: string;
    parameters:{[key: string]: any}; // Flexible key-value pairs for different settings
}

export interface userDTO{
  id?: number;
  username: string;
  email: string;
  daws: DawDTO[];

}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

// --------------------------Forums types---------------------

export interface commentsDTO{
  id?: number;
  createdAt: Date;
  userId: number;
  parentPostId: number;
  content: string;
}

export interface forumsDTO{
  id?: number;
  createdAt: Date;
  postType: string;
  userId: number;
  username: string;
  title: string;
}

export interface forumPageDTO{
  id?: number;
  createdAt: Date;
  postType: string;
  userId: number;
  userName: string;
  title: string;
  description: string;  
  comments: commentsDTO[];
}

// The DTO objects that will be sent out

export interface forumPagePostDTO {
  createdAt: Date;
  postType: string;
  userId: number;
  userName: string;
  title: string;
  description: string;
  comments: commentsDTO[] | null;
}

export interface commentsPostDTO{
  createdAt: Date;
  userId: number;
  userName: string;
  parentPostId: number;
  content: string;
}

export interface ratingsCommentPostDTO {
  dawId: string;
  rating: number; 
  userId: number;
  username: string;
  comment: string;
  createdAt: string; 
}

// Also works as post. Didn't really need to add another but I will
export interface recievedSessionNoteDTO {
  id?: number;
  userId?: number;
  title?: string;
  content?: string;

}

export interface SessionNotePostDTO {
  id?: number;
  userId?: number;
  title?: string;
  content?: string;

}

// ------------------- recieved -------------------

export interface RatingsPageDTO {
  id: number;
  dawId: string;
  rating: number; // Handles the double (e.g., 4.5)
  comments: ReceivedRatingsCommentDTO[];
}

export interface ReceivedRatingsCommentDTO {
  dawId: string;
  rating: number;
  userId: number;
  username: string;
  comment: string;
  createdAt: string; // Received as "2025-10-31T10:00:00"
}


//-------Needed a workaround. .ts files do not work with .jsx---------
/**
 * These are "Factory Functions". They return a fresh object 
 * that follows your DTO structure so you don't have to 
 * type it out manually every time you create a new component.
 */

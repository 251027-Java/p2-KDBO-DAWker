
// 4. The Top-Level DAW State. What is sent out on search
export interface DawDTO {
  id: string;
  userId: number;
  listOfConfigs: ConfigDTO[];
}

// 3. The saved list of configurations within a DAW
export interface ConfigDTO {
  id?: string;
  name: string;
  componentChain: ComponentDTO[];
}

// 2. The Individual components within the chain. 
// Order is important here as you decide how the audio signal flows
export interface ComponentDTO {
  id?: string;
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
    id?: string;
    Technology: 'RNBO' | 'TONEJS';
    export_name: string;
    parameters: Record<string, number | string | boolean>;
}
// types/index.ts
export interface Position {
    lat: number;
    lon: number;
  }
  
  export interface Node {
    id?: string;
    num: number;
    name: string;
    lastHeard: Date;
    snr: number;
    rssi: number;
    position: Position;
  }
  
  export interface Message {
    id?: string;
    type: 'text' | 'position' | 'data' | 'emergency';
    from: string;
    nodeId: number;
    text: string;
    timestamp: Date;
    received: Date;
    rssi: number;
    snr: number;
    hopCount: number;
    status: 'sent' | 'received' | 'pending';
    priority: 'normal' | 'high';
    categories?: string[];
    enhancedData?: Record<string, any>;
  }
  
  export interface Resource {
    id?: string;
    name: string;
    status: 'available' | 'needed' | 'pending';
    priority: 'low' | 'medium' | 'high' | 'critical';
    quantity: number;
    nodeId: number;
  }
  
  export interface ConnectionStatus {
    isConnected: boolean;
    error: string | null;
  }
  
  // Constants for the application
  export const MESH_CONSTANTS = {
    MESSAGE_FETCH_LIMIT: 100,
    UPDATE_INTERVAL: 5000,
    CONNECTION_TIMEOUT: 1000,
    MAX_RETRIES: 3,
  } as const;
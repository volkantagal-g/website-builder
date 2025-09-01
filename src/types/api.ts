export interface ApiEndpoint {
  id: string;
  name: string;
  variable: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  isActive: boolean;
}

export interface ApiResponse {
  endpointId: string;
  data: any;
  status: number;
  error?: string;
  timestamp: number;
}

export interface ApiContextType {
  endpoints: ApiEndpoint[];
  responses: Record<string, ApiResponse>;
  addEndpoint: (endpoint: Omit<ApiEndpoint, 'id'>) => void;
  updateEndpoint: (id: string, endpoint: Partial<ApiEndpoint>) => void;
  deleteEndpoint: (id: string) => void;
  executeEndpoint: (id: string) => Promise<void>;
  executeAllActiveEndpoints: () => Promise<void>;
  getResponseData: (variable: string) => any;
}

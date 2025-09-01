import React, { createContext, useContext, useState, useCallback } from 'react';
import { ApiEndpoint, ApiResponse, ApiContextType } from '../types/api';

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});

  const addEndpoint = useCallback((endpoint: Omit<ApiEndpoint, 'id'>) => {
    const newEndpoint: ApiEndpoint = {
      ...endpoint,
      id: `endpoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setEndpoints(prev => [...prev, newEndpoint]);
  }, []);

  const updateEndpoint = useCallback((id: string, updates: Partial<ApiEndpoint>) => {
    setEndpoints(prev => prev.map(endpoint => 
      endpoint.id === id ? { ...endpoint, ...updates } : endpoint
    ));
  }, []);

  const deleteEndpoint = useCallback((id: string) => {
    setEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
    setResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[id];
      return newResponses;
    });
  }, []);

  const executeEndpoint = useCallback(async (id: string) => {
    const endpoint = endpoints.find(ep => ep.id === id);
    if (!endpoint) return;

    try {
      console.log(`🚀 Executing API: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      
      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers
        }
      };

      if (endpoint.method !== 'GET' && endpoint.body) {
        requestOptions.body = endpoint.body;
      }

      const response = await fetch(endpoint.url, requestOptions);
      const data = await response.json();

      const apiResponse: ApiResponse = {
        endpointId: id,
        data,
        status: response.status,
        timestamp: Date.now()
      };

      setResponses(prev => ({
        ...prev,
        [id]: apiResponse
      }));

      console.log(`✅ API Response for ${endpoint.variable}:`, data);
      
    } catch (error) {
      console.error(`❌ API Error for ${endpoint.name}:`, error);
      
      const apiResponse: ApiResponse = {
        endpointId: id,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };

      setResponses(prev => ({
        ...prev,
        [id]: apiResponse
      }));
    }
  }, [endpoints]);

  const executeAllActiveEndpoints = useCallback(async () => {
    const activeEndpoints = endpoints.filter(ep => ep.isActive);
    console.log(`🔄 Executing ${activeEndpoints.length} active endpoints`);
    
    await Promise.all(
      activeEndpoints.map(endpoint => executeEndpoint(endpoint.id))
    );
  }, [endpoints, executeEndpoint]);

  const getResponseData = useCallback((variable: string) => {
    const endpoint = endpoints.find(ep => ep.variable === variable);
    if (!endpoint) return null;
    
    const response = responses[endpoint.id];
    return response?.data || null;
  }, [endpoints, responses]);

  const value: ApiContextType = {
    endpoints,
    responses,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
    executeEndpoint,
    executeAllActiveEndpoints,
    getResponseData
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ApiEndpoint, ApiResponse, ApiContextType } from '../types/api';
import { STORAGE_KEYS } from '../constants/storage';

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(() => {
    // Load endpoints from canvas-components localStorage
    try {
      const savedCanvasData = localStorage.getItem(STORAGE_KEYS.CANVAS_COMPONENTS);
      if (savedCanvasData) {
        const parsedData = JSON.parse(savedCanvasData);
        
        // Yeni format: { components: [], endpoints: [] }
        if (parsedData.endpoints && Array.isArray(parsedData.endpoints)) {
          console.log('📂 Loading API endpoints from canvas data:', parsedData.endpoints.length, 'endpoints');
          return parsedData.endpoints;
        }
        
        // Eski format - backward compatibility
        const savedEndpoints = localStorage.getItem(STORAGE_KEYS.API_ENDPOINTS);
        if (savedEndpoints) {
          const parsed = JSON.parse(savedEndpoints);
          console.log('📂 Loading API endpoints from legacy localStorage:', parsed.length, 'endpoints');
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading API endpoints from localStorage:', error);
    }
    return [];
  });
  
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  // Note: API responses are not persisted - they should be fetched fresh each time

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

  // Save endpoints to canvas-components localStorage whenever they change
  useEffect(() => {
    if (endpoints.length > 0) {
      console.log('💾 Saving API endpoints to canvas data:', endpoints.length, 'endpoints');
      
      // Mevcut canvas data'yı oku
      const savedCanvasData = localStorage.getItem(STORAGE_KEYS.CANVAS_COMPONENTS);
      let canvasData: { components: unknown[]; endpoints: ApiEndpoint[] } = { components: [], endpoints: [] };
      
      if (savedCanvasData) {
        try {
          const parsed = JSON.parse(savedCanvasData);
          if (parsed.components && Array.isArray(parsed.components)) {
            canvasData = parsed;
          } else if (Array.isArray(parsed)) {
            // Eski format - components array'i
            canvasData = { components: parsed, endpoints: [] };
          }
        } catch (error) {
          console.error('Error parsing existing canvas data:', error);
        }
      }
      
      // Endpoint'leri güncelle
      canvasData.endpoints = endpoints;
      
      // Canvas data'yı kaydet
      localStorage.setItem(STORAGE_KEYS.CANVAS_COMPONENTS, JSON.stringify(canvasData));
      
      // Eski format'ı temizle
      localStorage.removeItem(STORAGE_KEYS.API_ENDPOINTS);
    } else {
      // Endpoint yoksa, canvas data'dan da kaldır
      const savedCanvasData = localStorage.getItem(STORAGE_KEYS.CANVAS_COMPONENTS);
      if (savedCanvasData) {
        try {
          const parsed = JSON.parse(savedCanvasData);
          if (parsed.components && Array.isArray(parsed.components)) {
            const updatedCanvasData = { ...parsed, endpoints: [] };
            localStorage.setItem(STORAGE_KEYS.CANVAS_COMPONENTS, JSON.stringify(updatedCanvasData));
          }
        } catch (error) {
          console.error('Error updating canvas data:', error);
        }
      }
    }
  }, [endpoints]);

  // Note: API responses are not saved to localStorage - they should be fetched fresh each time
  // This ensures we always get the latest data from APIs

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

import React, { useState } from 'react';
import { FiPlus, FiPlay, FiTrash2, FiEdit3, FiCheck, FiX, FiRefreshCw, FiGlobe } from 'react-icons/fi';
import { useApi } from '../../context/ApiContext';
import { ApiEndpoint } from '../../types/api';

export const ApiEndpointsPanel: React.FC = () => {
  const { 
    endpoints, 
    responses, 
    addEndpoint, 
    updateEndpoint, 
    deleteEndpoint, 
    executeEndpoint, 
    executeAllActiveEndpoints 
  } = useApi();

  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newEndpoint, setNewEndpoint] = useState<Omit<ApiEndpoint, 'id'>>({
    name: '',
    variable: '',
    url: '',
    method: 'GET',
    headers: {},
    body: '',
    isActive: true
  });


  const handleAddEndpoint = () => {
    if (newEndpoint.name && newEndpoint.variable && newEndpoint.url) {
      // Variable name'i camelCase yap ve boşlukları kaldır
      const cleanVariable = newEndpoint.variable.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      
      addEndpoint({
        ...newEndpoint,
        variable: cleanVariable
      });
      
      setNewEndpoint({
        name: '',
        variable: '',
        url: '',
        method: 'GET',
        headers: {},
        body: '',
        isActive: true
      });
      setIsAddingNew(false);
    }
  };





  const formatResponse = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return '#22c55e';
    if (status >= 400 && status < 500) return '#f59e0b';
    if (status >= 500) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div style={{
      padding: '8px 0',
      backgroundColor: '#ffffff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>API Endpoints</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={executeAllActiveEndpoints}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Execute All Active Endpoints"
          >
            <FiRefreshCw size={12} />
            Run All
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            style={{
              background: '#6b3ff7',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FiPlus size={12} />
            Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px'
      }}>
        {/* Add New Endpoint Form */}
        {isAddingNew && (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., User Data"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Variable (no spaces)
                </label>
                <input
                  type="text"
                  value={newEndpoint.variable}
                  onChange={(e) => setNewEndpoint(prev => ({ 
                    ...prev, 
                    variable: e.target.value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                  }))}
                  placeholder="e.g., userData"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: '0 0 100px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Method
                  </label>
                  <select
                    value={newEndpoint.method}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, method: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    URL
                  </label>
                  <input
                    type="text"
                    value={newEndpoint.url}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://api.example.com/users"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {(newEndpoint.method === 'POST' || newEndpoint.method === 'PUT' || newEndpoint.method === 'PATCH') && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Request Body (JSON)
                  </label>
                  <textarea
                    value={newEndpoint.body}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, body: e.target.value }))}
                    placeholder='{"key": "value"}'
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => setIsAddingNew(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <FiX size={14} style={{ marginRight: '4px' }} />
                  Cancel
                </button>
                <button
                  onClick={handleAddEndpoint}
                  disabled={!newEndpoint.name || !newEndpoint.variable || !newEndpoint.url}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: newEndpoint.name && newEndpoint.variable && newEndpoint.url ? '#6b3ff7' : '#d1d5db',
                    color: 'white',
                    cursor: newEndpoint.name && newEndpoint.variable && newEndpoint.url ? 'pointer' : 'not-allowed',
                    fontSize: '14px'
                  }}
                >
                  <FiCheck size={14} style={{ marginRight: '4px' }} />
                  Add Endpoint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Endpoints List */}
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '12px',
            backgroundColor: 'white'
          }}>
            {/* Endpoint Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: endpoint.method === 'GET' ? '#dbeafe' : 
                                  endpoint.method === 'POST' ? '#dcfce7' :
                                  endpoint.method === 'PUT' ? '#fef3c7' :
                                  endpoint.method === 'DELETE' ? '#fee2e2' : '#f3f4f6',
                  color: endpoint.method === 'GET' ? '#1d4ed8' : 
                         endpoint.method === 'POST' ? '#166534' :
                         endpoint.method === 'PUT' ? '#92400e' :
                         endpoint.method === 'DELETE' ? '#dc2626' : '#374151'
                }}>
                  {endpoint.method}
                </span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {endpoint.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Variable: <code>{endpoint.variable}</code>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={endpoint.isActive}
                    onChange={(e) => updateEndpoint(endpoint.id, { isActive: e.target.checked })}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Active</span>
                </label>
                <button
                  onClick={() => executeEndpoint(endpoint.id)}
                  style={{
                    padding: '6px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  title="Execute Endpoint"
                >
                  <FiPlay size={12} />
                </button>
                <button
                  onClick={() => console.log('Edit endpoint:', endpoint.id)}
                  style={{
                    padding: '6px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  title="Edit Endpoint"
                >
                  <FiEdit3 size={12} />
                </button>
                <button
                  onClick={() => deleteEndpoint(endpoint.id)}
                  style={{
                    padding: '6px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  title="Delete Endpoint"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>

            {/* Endpoint Details */}
            <div style={{
              padding: '12px 16px',
              fontSize: '12px',
              color: '#6b7280',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>URL:</strong> {endpoint.url}
              </div>
              
              {/* Response Display */}
              {responses[endpoint.id] && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <strong>Response:</strong>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(responses[endpoint.id].status),
                      color: 'white'
                    }}>
                      {responses[endpoint.id].status}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {new Date(responses[endpoint.id].timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {responses[endpoint.id].error ? (
                    <div style={{
                      padding: '8px',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      color: '#dc2626',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}>
                      {responses[endpoint.id].error}
                    </div>
                  ) : (
                    <div style={{
                      padding: '8px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      maxHeight: '200px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {formatResponse(responses[endpoint.id].data)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {endpoints.length === 0 && !isAddingNew && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            <FiGlobe size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            No API endpoints configured
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => setIsAddingNew(true)}
                style={{
                  color: '#6b3ff7',
                  textDecoration: 'underline',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                Add your first endpoint
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

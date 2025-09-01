import React from 'react';

export interface ArrayInputProps {
  value: any[];
  onChange: (value: any[]) => void;
  propName: string;
}

export const ArrayInput: React.FC<ArrayInputProps> = ({ 
  value, 
  onChange, 
  propName 
}) => {
  const arrayValue = Array.isArray(value) ? value : [];
  
  const addItem = () => {
    const newArray = [...arrayValue, { 
      id: Date.now(), 
      label: 'New Option', 
      value: 'new-option' 
    }];
    onChange(newArray);
  };
  
  const updateItem = (index: number, field: string, newValue: string) => {
    const newArray = [...arrayValue];
    newArray[index] = { ...newArray[index], [field]: newValue };
    onChange(newArray);
  };
  
  const removeItem = (index: number) => {
    const newArray = arrayValue.filter((_, i) => i !== index);
    onChange(newArray);
  };
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#495057',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {propName}
        </label>
        <button
          onClick={addItem}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            backgroundColor: '#6b3ff7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b3ff7'}
        >
          + Add Item
        </button>
      </div>
      
      <div style={{
        maxHeight: '120px',
        overflow: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
      }}>
        {arrayValue.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '12px',
            fontStyle: 'italic',
            padding: '16px',
          }}>
            No items. Click "Add Item" to add options.
          </div>
        ) : (
          arrayValue.map((item, index) => (
            <div key={item.id || index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              marginBottom: '8px',
            }}>
              <input
                type="text"
                value={item.label || ''}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
                placeholder="Label"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <input
                type="text"
                value={item.value || ''}
                onChange={(e) => updateItem(index, 'value', e.target.value)}
                placeholder="Value"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <button
                onClick={() => removeItem(index)}
                style={{
                  padding: '4px 6px',
                  fontSize: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                title="Remove Item"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import { ApiContextType } from '../types/api';

/**
 * Template binding utility for processing {{variable.path}} syntax
 * Example: "{{dataPayload.data.name}}" -> actual value from API response
 */

export interface TemplateBindingOptions {
  getResponseData: ApiContextType['getResponseData'];
  componentType?: string; // Component tipi (örn: 'switch')
  propType?: string; // Prop tipi (örn: 'boolean')
}

/**
 * Process a template string and replace {{variable.path}} with actual values
 */
export const processTemplate = (
  template: string | any, 
  options: TemplateBindingOptions
): any => {
  // If not a string, return as-is
  if (typeof template !== 'string') {
    return template;
  }

  // Check if it's a template binding
  const templateRegex = /\{\{([^}]+)\}\}/g;
  
  // If no template patterns found, return original
  if (!templateRegex.test(template)) {
    return template;
  }

  // Reset regex for actual processing
  templateRegex.lastIndex = 0;
  
  let result = template;
  let match;

  while ((match = templateRegex.exec(template)) !== null) {
    const fullMatch = match[0]; // "{{dataPayload.data.name}}"
    const path = match[1].trim(); // "dataPayload.data.name"
    
    try {
      const value = resolveDataPath(path, options.getResponseData);
      console.log('🔍 Template binding:', { template, path, value, fullMatch });
      
      // Replace the template with the resolved value
      if (value !== undefined && value !== null) {
        result = result.replace(fullMatch, String(value));
        console.log('✅ Template resolved:', { fullMatch, value, result });
      } else {
        // Boolean prop'lar için değer bulunamazsa false gönder
        if (options.propType === 'boolean') {
          result = result.replace(fullMatch, 'false');
          console.warn(`Template binding: Value not found for path "${path}", using false for boolean prop`);
        } else {
          // Diğer prop tipleri için template'i olduğu gibi bırak
          console.warn(`Template binding: Value not found for path "${path}", keeping template`);
        }
      }
    } catch (error) {
      console.error(`Template binding error for "${path}":`, error);
    }
  }

  // Try to convert to appropriate type
  return convertType(result, template);
};

/**
 * Resolve a data path like "dataPayload.data.name"
 */
const resolveDataPath = (
  path: string, 
  getResponseData: TemplateBindingOptions['getResponseData']
): any => {
  const parts = path.split('.');
  
  if (parts.length === 0) {
    return undefined;
  }

  // First part is the variable name (e.g., "dataPayload")
  const variableName = parts[0];
  const data = getResponseData(variableName);
  
  if (!data) {
    return undefined;
  }

  // Navigate through the rest of the path
  let current = data;
  for (let i = 1; i < parts.length; i++) {
    const key = parts[i];
    
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
};

/**
 * Convert string result back to appropriate type if possible
 */
const convertType = (result: string, original: string): any => {
  // If the entire string was a template, try to preserve original type
  if (result !== original && original.match(/^\{\{[^}]+\}\}$/)) {
    // Try to parse as number
    const num = Number(result);
    if (!isNaN(num) && isFinite(num)) {
      return num;
    }
    
    // Try to parse as boolean
    if (result === 'true') return true;
    if (result === 'false') return false;
    
    // Try to parse as JSON
    try {
      return JSON.parse(result);
    } catch {
      // Return as string
    }
  }

  return result;
};

/**
 * Process all props of a component recursively
 */
export const processComponentProps = (
  props: Record<string, any>,
  options: TemplateBindingOptions,
  componentMetadata?: any
): Record<string, any> => {
  const processedProps: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Prop tipini component metadata'sından al
      const propType = componentMetadata?.props?.[key] || 'string';
      processedProps[key] = processTemplate(value, { ...options, propType });
    } else if (Array.isArray(value)) {
      processedProps[key] = value.map(item => 
        typeof item === 'string' ? processTemplate(item, options) : item
      );
    } else if (value && typeof value === 'object') {
      processedProps[key] = processComponentProps(value, options, componentMetadata);
    } else {
      processedProps[key] = value;
    }
  }

  return processedProps;
};

/**
 * Check if a string contains template bindings
 */
export const hasTemplateBindings = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  return /\{\{[^}]+\}\}/.test(value);
};

/**
 * Extract all template variables from a string
 */
export const extractTemplateVariables = (template: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const path = match[1].trim();
    const variableName = path.split('.')[0];
    if (!variables.includes(variableName)) {
      variables.push(variableName);
    }
  }

  return variables;
};

/**
 * Get all template bindings used in component props
 */
export const getComponentTemplateBindings = (
  props: Record<string, any>
): string[] => {
  const bindings: string[] = [];

  const processValue = (value: any) => {
    if (typeof value === 'string') {
      bindings.push(...extractTemplateVariables(value));
    } else if (Array.isArray(value)) {
      value.forEach(processValue);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(processValue);
    }
  };

  Object.values(props).forEach(processValue);
  
  return [...new Set(bindings)]; // Remove duplicates
};

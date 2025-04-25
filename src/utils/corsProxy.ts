/**
 * CORS Proxy utility to handle API requests when direct calls might encounter CORS issues
 */
import { USE_CORS_PROXY, CORS_PROXY_URL } from './config';

/**
 * Wraps a URL with a CORS proxy if needed
 * @param url The original API URL
 * @returns URL with CORS proxy if enabled
 */
export const withCorsProxy = (url: string): string => {
  return USE_CORS_PROXY ? `${CORS_PROXY_URL}${url}` : url;
}; 
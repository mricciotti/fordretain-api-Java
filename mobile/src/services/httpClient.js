import { getFirebaseIdToken } from './authService';
import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';
const API_URL = (Platform.OS === 'web' && configuredApiUrl.includes('10.0.2.2')
  ? configuredApiUrl.replace('10.0.2.2', 'localhost')
  : configuredApiUrl).replace(/\/$/, '');

const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}, retry = true) {
  const token = await getFirebaseIdToken(!retry);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('A API demorou demais para responder. Verifique sua conexão e tente novamente.', 0, 'timeout');
    }
    throw new ApiError('Não foi possível conectar à API FordRetain.', 0, error?.message);
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && retry) {
    return apiRequest(path, options, false);
  }

  const body = await parseResponse(response);

  if (!response.ok) {
    const message = body?.mensagem || body?.message || body?.erro || `A API respondeu com status ${response.status}.`;
    throw new ApiError(message, response.status, body);
  }

  return body;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || 'An error occurred';
      } catch {
        errorMessage = errorText || 'An error occurred';
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as T;
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  // Poll endpoints
  async createPoll(pollData: {
    title: string;
    description?: string;
    expiresAt?: string;
    allowAnonymous?: boolean;
    questions: Array<{
      text: string;
      type: 'single' | 'multiple' | 'text';
      options?: string[];
      conditionalLogic?: any;
      order?: number;
      required?: boolean;
    }>;
  }) {
    return this.request<any>('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  }

  async getPolls() {
    return this.request<any[]>('/polls');
  }

  async getPoll(id: string) {
    return this.request<any>(`/polls/${id}`);
  }

  async getPollResults(id: string) {
    return this.request<any>(`/polls/${id}/results`);
  }

  async updatePoll(id: string, pollData: {
    title?: string;
    description?: string;
    isActive?: boolean;
    expiresAt?: string;
    allowAnonymous?: boolean;
  }) {
    return this.request<any>(`/polls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(pollData),
    });
  }

  async deletePoll(id: string) {
    return this.request<void>(`/polls/${id}`, {
      method: 'DELETE',
    });
  }

  // Answer endpoints
  async submitAnswer(pollId: string, answers: Array<{
    questionId: string;
    value: string | string[];
    sessionId?: string;
  }>) {
    return this.request<any>(`/polls/${pollId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async submitAnonymousAnswer(pollId: string, answers: Array<{
    questionId: string;
    value: string | string[];
    sessionId?: string;
  }>) {
    return this.request<any>(`/polls/${pollId}/answers/anonymous`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE);
export { ApiError };
export type { ApiResponse };

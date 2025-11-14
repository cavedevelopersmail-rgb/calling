const API_BASE_URL = 'http://localhost:8001/api';

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  auth: {
    signUp: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    signIn: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    },

    signOut: async () => {
      localStorage.removeItem('authToken');
      return { success: true };
    },

    getUser: async () => {
      const token = getAuthToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  },

  calls: {
    getAll: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    create: async (callData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(callData),
      });
      return handleResponse(response);
    },
  },

  scheduledCalls: {
    getAll: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/scheduled-calls`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    create: async (callData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/scheduled-calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(callData),
      });
      return handleResponse(response);
    },

    update: async (id, callData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/scheduled-calls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(callData),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/scheduled-calls/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },

    updateStatus: async (id, status) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/scheduled-calls/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    },
  },

  import: {
    upload: async (formData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/import/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return handleResponse(response);
    },

    save: async (data) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/import/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getHistory: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/import/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return handleResponse(response);
    },
  },
};

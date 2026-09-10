const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Robust fetch wrapper with JSON parsing and standardized HTTP error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `API request failed with status ${response.status}: ${errorText || response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(`Fetch error at ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  /**
   * Fetch all items (supports optional json-server query params)
   */
  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/items?${query}` : '/items';
    return request(endpoint);
  },

  /**
   * Fetch a single item by id
   */
  async getItem(id) {
    return request(`/items/${encodeURIComponent(id)}`);
  },

  /**
   * Create a new item
   */
  async createItem(itemData) {
    return request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  /**
   * Partially update an item (e.g. status: "collected")
   */
  async updateItem(id, updates) {
    return request(`/items/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete an item
   */
  async deleteItem(id) {
    return request(`/items/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

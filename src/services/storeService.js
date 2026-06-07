import apiClient from './apiClient';

export const storeService = {
  /**
   * Fetch stores list from backend
   */
  async getStores() {
    return apiClient.get('/stores/list');
  },

  /**
   * Register a new store (multipart/form-data)
   */
  async addStore(name, categoryId, logoFile) {
    const formData = new FormData();
    formData.append('store_name', name);
    formData.append('category_id', categoryId);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    return apiClient.post('/stores/add', formData);
  },

  /**
   * Update store details (multipart/form-data)
   */
  async updateStore(id, name, categoryId, logoFile, status) {
    const formData = new FormData();
    formData.append('store_name', name);
    formData.append('category_id', categoryId);
    formData.append('status', status === 'Active' ? 1 : 0);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    return apiClient.patch(`/stores/update/${id}`, formData);
  },

  /**
   * Add a voucher/gift card mapping to a store
   */
  async addVoucher(storeId, sku, featured) {
    return apiClient.post('/gift-cards/add', {
      store_id: Number(storeId),
      sku: sku.trim(),
      featured: Number(featured)
    });
  },

  /**
   * Get synced products/vouchers from Woohoo
   */
  async getSyncedProducts() {
    return apiClient.get('/woohoo/products');
  },

  /**
   * Get mapped vouchers/gift cards for a store
   */
  async getStoreVouchers(storeId) {
    return apiClient.get(`/gift-cards/store/${storeId}`);
  },

  /**
   * Fetch all gift cards in the catalog
   */
  async getGiftCards() {
    return apiClient.get('/gift-cards/lists');
  },

  /**
   * Delete a gift card mapping from a store
   */
  async deleteVoucher(id) {
    return apiClient.delete(`/gift-cards/delete/${id}`);
  }
};

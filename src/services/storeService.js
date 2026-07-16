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
  async addStore(name, logoFile) {
    const formData = new FormData();
    formData.append('store_name', name);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    return apiClient.post('/stores/add', formData);
  },

  /**
   * Update store details (multipart/form-data)
   */
  async updateStore(id, name, logoFile, status) {
    const formData = new FormData();
    formData.append('store_name', name);
    formData.append('status', status === 'Active' ? 1 : 0);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    return apiClient.patch(`/stores/update/${id}`, formData);
  },

  /**
   * Add a voucher/gift card mapping to a store
   */
  async addVoucher(storeId, sku, featured, categoryId, giftcardImage) {
    const formData = new FormData();
    formData.append('store_id', Number(storeId));
    formData.append('sku', sku.trim());
    formData.append('featured', Number(featured));
    formData.append('category_id', Number(categoryId));
    if (giftcardImage) {
      formData.append('giftcard_image', giftcardImage);
    }
    return apiClient.post('/gift-cards/add', formData);
  },

  /**
   * Update voucher/gift card mapping
   */
  async updateVoucher(id, storeId, sku, featured, categoryId, giftcardImage) {
    const formData = new FormData();
    formData.append('store_id', Number(storeId));
    formData.append('sku', sku.trim());
    formData.append('featured', Number(featured));
    formData.append('category_id', Number(categoryId));
    if (giftcardImage) {
      formData.append('giftcard_image', giftcardImage);
    }
    return apiClient.patch(`/gift-cards/update/${id}`, formData);
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
  },

  /**
   * Delete a store
   */
  async deleteStore(id) {
    return apiClient.delete(`/stores/delete/${id}`);
  },

  /**
   * Fetch Woohoo product catalog details by SKU (requires custom Woohoo Bearer Token)
   */
  async getWoohooProductBySku(sku, woohooToken) {
    return apiClient.get(`/woohoo/catalog/products/${sku}`, {
      headers: {
        'Authorization': `Bearer ${woohooToken}`
      }
    });
  },

  /**
   * Generate Woohoo authorization code
   */
  async generateWoohooCode() {
    return apiClient.post('/woohoo/auth/generate-code');
  },

  /**
   * Generate Woohoo bearer token using authorization code
   */
  async generateWoohooToken(authorizationCode) {
    return apiClient.post('/woohoo/auth/generate-token', {
      authorizationCode
    });
  },

  /**
   * Update gift card status (uses standard admin login token)
   */
  async updateGiftCardStatus(id, status) {
    return apiClient.patch(`/gift-cards/update/${id}`, { status });
  }
};

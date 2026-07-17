import apiClient from './apiClient';

export const bannerService = {
  /**
   * Fetch all banners from the backend
   */
  async getBanners() {
    return apiClient.get('/banners/list');
  },

  /**
   * Add a new banner (multipart/form-data)
   * @param {Object} data - Banner attributes including image file
   */
  async addBanner(data) {
    const formData = new FormData();
    
    if (data.banner_image) {
      formData.append('banner_image', data.banner_image);
    }
    
    return apiClient.post('/banners/add', formData);
  }
};

export const categoryService = {
  /**
   * Fetch categories from backend
   */
  async getCategories() {
    return apiClient.get('/store-categories/admin/list');
  },

  /**
   * Add new category (multipart/form-data)
   */
  async addCategory(name, status, logoFile) {
    const formData = new FormData();
    formData.append('category_name', name);
    formData.append('status', status === 'Active' ? 1 : 0);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    return apiClient.post('/store-categories/add', formData);
  },

  /**
   * Update category (multipart/form-data)
   */
  async updateCategory(id, name, status, logoFile) {
    const formData = new FormData();
    formData.append('category_name', name);
    formData.append('status', status === 'Active' ? 1 : 0);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    return apiClient.patch(`/store-categories/update/${id}`, formData);
  },

  /**
   * Delete category
   */
  async deleteCategory(id) {
    return apiClient.delete(`/store-categories/delete/${id}`);
  }
};

export const couponService = {
  /**
   * Fetch paginated coupons/offers from the backend
   * @param {number} page  - Page number (1-based)
   * @param {number} limit - Items per page
   */
  async getCoupons(page = 1, limit = 10) {
    return apiClient.get(`/offers/list?page=${page}&limit=${limit}`);
  },

  /**
   * Add a new coupon/offer
   * @param {Object} data - Coupon fields matching the API payload
   */
  async addCoupon(data) {
    return apiClient.post('/offers/add', {
      offer_name: data.offer_name,
      offer_type: Number(data.offer_type),
      promo_code: data.promo_code,
      value_type: Number(data.value_type),
      value: Number(data.value),
      min_order_amount: Number(data.min_order_amount),
      max_discount: Number(data.max_discount),
      total_usage_limit: Number(data.total_usage_limit),
      per_user_limit: Number(data.per_user_limit),
      unique_users_only: Number(data.unique_users_only),
      priority: Number(data.priority),
      start_date: data.start_date,
      end_date: data.end_date,
      status: Number(data.status),
      store_id: data.store_id ? Number(data.store_id) : null,
      gift_card_id: data.gift_card_id ? Number(data.gift_card_id) : null,
    });
  },

  /**
   * Update an existing coupon/offer
   * @param {number|string} id - Coupon ID
   * @param {Object} data - Coupon fields matching the API payload
   */
  async updateCoupon(id, data) {
    return apiClient.patch(`/offers/update/${id}`, {
      offer_name: data.offer_name,
      offer_type: Number(data.offer_type),
      promo_code: data.promo_code || null,
      value_type: Number(data.value_type),
      value: Number(data.value),
      min_order_amount: Number(data.min_order_amount),
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      total_usage_limit: data.total_usage_limit ? Number(data.total_usage_limit) : null,
      per_user_limit: data.per_user_limit ? Number(data.per_user_limit) : null,
      unique_users_only: Number(data.unique_users_only),
      start_date: data.start_date,
      end_date: data.end_date,
      status: Number(data.status),
      store_id: data.store_id ? Number(data.store_id) : null,
      gift_card_id: data.gift_card_id ? Number(data.gift_card_id) : null,
    });
  },

  /**
   * Update an existing coupon/offer status
   * @param {number|string} id - Coupon ID
   * @param {number} status - 1 for active, 0 for inactive
   */
  async updateCouponStatus(id, status) {
    return apiClient.patch(`/offers/update-status/${id}`, { status });
  },

  /**
   * Delete a coupon/offer
   * @param {number|string} id - Coupon ID
   */
  async deleteCoupon(id) {
    return apiClient.delete(`/offers/delete/${id}`);
  },
};

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
    return apiClient.get('/gift-cards/admin/list');
  },

  /**
   * Fetch a single gift card details by ID (Admin)
   */
  async getGiftCardById(id) {
    return apiClient.get(`/gift-cards/${id}`);
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

export const subadminService = {
  /**
   * Fetch sub-admins list from backend
   */
  async getSubAdmins() {
    return apiClient.get('/sub-admin/list');
  },

  /**
   * Add a new sub-admin
   */
  async addSubAdmin(name, email, phone, password, status = 'Active') {
    return apiClient.post('/sub-admin/add', {
      name,
      email,
      phone,
      password,
      is_active: status === 'Active' ? 1 : 0
    });
  },

  /**
   * Update sub-admin details
   */
  async updateSubAdmin(id, name, email, phone, password, status) {
    const payload = {
      name,
      email,
      phone,
      is_active: status === 'Active' ? 1 : 0
    };
    if (password && password.trim() !== '') {
      payload.password = password;
    }
    return apiClient.patch(`/sub-admin/update/${id}`, payload);
  },

  /**
   * Delete sub-admin
   */
  async deleteSubAdmin(id) {
    return apiClient.delete(`/sub-admin/delete/${id}`);
  }
};

export const userService = {
  /**
   * Fetch all users from backend
   */
  async getUsers() {
    return apiClient.get('/user/get-all');
  },

  /**
   * Update user active status
   */
  async updateUserStatus(id, isActive) {
    return apiClient.patch(`/user/status/${id}`, { is_active: isActive });
  }
};

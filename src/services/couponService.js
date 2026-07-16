import apiClient from './apiClient';

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

import apiClient from './apiClient';

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

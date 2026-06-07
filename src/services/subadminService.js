import apiClient from './apiClient';

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

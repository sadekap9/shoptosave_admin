import apiClient from './apiClient';

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

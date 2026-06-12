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

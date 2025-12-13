import { client } from './client';

const formHeaders = { 'Content-Type': 'multipart/form-data' };

export const uploadAPI = {
  uploadImage: (formData) => client.post('/uploads/image', formData, { headers: formHeaders }),
  uploadProductImage: (productId, formData) =>
    client.post(`/uploads/product/${productId}/image`, formData, { headers: formHeaders }),
  uploadAvatar: (formData) => client.post('/uploads/avatar', formData, { headers: formHeaders }),
  deleteFile: (data) => client.post('/uploads/delete', data),
};

export default uploadAPI;

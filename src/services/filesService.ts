import { File } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const filesService = {
  // Upload a new file
  async uploadFile(formData: FormData) {
    console.log('📤 Uploading file to:', `${API_URL}/files`);
    const response = await fetch(`${API_URL}/files`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });
    const data = await response.json();
    console.log('📦 Upload response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to upload file');
    return data.data;
  },

  // Get all files (Admin)
  async getAll(): Promise<File[]> {
    console.log('🔍 Fetching all files from:', `${API_URL}/files`);
    const response = await fetch(`${API_URL}/files`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('📦 Files response:', { ok: response.ok, status: response.status, count: data.data?.length });
    if (!response.ok) throw new Error(data.error || 'Failed to fetch files');
    return data.data;
  },

  // Get operator files
  async getOperatorFiles(): Promise<File[]> {
    console.log('🔍 Fetching operator files from:', `${API_URL}/files/operator/my-files`);
    const response = await fetch(`${API_URL}/files/operator/my-files`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('📦 Operator files response:', { ok: response.ok, status: response.status, count: data.data?.length });
    if (!response.ok) throw new Error(data.error || 'Failed to fetch operator files');
    return data.data;
  },

  // Update file
  async updateFile(id: string, updateData: Partial<File>) {
    console.log('🔄 Updating file:', { id, updateData });
    const response = await fetch(`${API_URL}/files/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    console.log('📦 Update response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to update file');
    return data.data;
  },

  // Delete file
  async deleteFile(id: string) {
    console.log('🗑️ Deleting file:', id);
    const response = await fetch(`${API_URL}/files/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('📦 Delete response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to delete file');
    return data;
  },

  // Get file URL for inline viewing (requires auth header in fetch)
  getFileUrl(fileUrl: string): string {
    // Extract filename from path (e.g., "/uploads/123456-file.pdf" -> "123456-file.pdf")
    const filename = fileUrl.split('/').pop();
    // Use the new endpoint that sets proper headers for inline display
    return `${API_URL}/files/view/${filename}`;
  },
};

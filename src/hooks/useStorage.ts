import { adminApi } from '../lib/api';

export function useStorage() {
    const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
        try {
            const folder = bucket === 'products' ? 'products' : 'branding';
            const uploaded = await adminApi.uploadImage(file, folder);
            return uploaded.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    };

    const deleteFile = async (_url: string, _bucket: string) => {
        // Cloudinary deletions require a public_id. Product rows keep that for
        // future cleanup jobs, but the current UI only replaces URLs.
    };

    return { uploadFile, deleteFile };
}

import { getEnvironments } from './get-environments';

const { VITE_CLOUDINARY_URL } = getEnvironments();

export const fileUpload = async (file: File): Promise<string> => {
  const formData = new FormData();

  formData.append('upload_preset', 'react-gallery');
  formData.append('file', file);

  try {
    const resp = await fetch(VITE_CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!resp.ok) throw new Error('Image not upload');
    const cloudResp = await resp.json();

    return cloudResp.secure_url;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(error.message);
    }

    throw new Error('Algo ha salido mal subiendo la imagen');
  }
};

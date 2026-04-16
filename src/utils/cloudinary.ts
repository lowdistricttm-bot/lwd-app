"use client";

/**
 * Carica un file su Cloudinary utilizzando l'endpoint unsigned.
 * Applica automaticamente f_auto,q_auto agli URL delle immagini.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');

  const response = await fetch('https://api.cloudinary.com/v1_1/dcogakkza/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Errore durante l\'upload su Cloudinary');
  }

  const data = await response.json();
  let url = data.secure_url;

  // Se è un'immagine, inseriamo i parametri di ottimizzazione automatica nell'URL
  if (data.resource_type === 'image') {
    // Trasforma .../upload/v123/... in .../upload/f_auto,q_auto/v123/...
    url = url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return url;
};
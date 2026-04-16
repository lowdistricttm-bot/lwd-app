"use client";

/**
 * Carica un file su Cloudinary utilizzando l'endpoint unsigned.
 * Applica automaticamente f_auto,q_auto per immagini e vc_auto,q_auto per video.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');

  // Cloudinary richiede di specificare il resource_type se non è un'immagine, 
  // ma l'endpoint di upload solitamente lo rileva automaticamente.
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

  // Ottimizzazione basata sul tipo di risorsa
  if (data.resource_type === 'video') {
    // Trasforma .../upload/v123/... in .../upload/vc_auto,q_auto/v123/...
    url = url.replace('/upload/', '/upload/vc_auto,q_auto/');
  } else if (data.resource_type === 'image') {
    // Trasforma .../upload/v123/... in .../upload/f_auto,q_auto/v123/...
    url = url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return url;
};
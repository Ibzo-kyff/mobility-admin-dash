const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';

export const getPhotoUrl = (photos: any) => {
  if (!photos) return null;
  const photo = Array.isArray(photos) ? photos[0] : photos;
  if (typeof photo !== 'string' || !photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

export const getAllPhotoUrls = (photos: any): string[] => {
  if (!photos) return [];

  try {
    if (Array.isArray(photos)) {
      return photos
        .filter(photo => photo && photo !== "" && photo !== null)
        .map(photo => {
          if (photo.startsWith('http')) return photo;
          return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
        });
    }

    if (typeof photos === 'string') {
      const photoArray = photos.split(',').filter(p => p && p !== "");
      return photoArray.map(photo => {
        if (photo.startsWith('http')) return photo;
        return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
      });
    }

    return [];
  } catch (error) {
    console.error('Erreur formatage photos:', error);
    return [];
  }
};

export default { getPhotoUrl, getAllPhotoUrls };

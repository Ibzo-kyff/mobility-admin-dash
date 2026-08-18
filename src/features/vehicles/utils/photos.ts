type PhotoObject = { url?: string; path?: string; src?: string };
export type PhotoInput = string | File | PhotoObject | Array<string | File | PhotoObject> | null | undefined;

export const getPhotoUrl = (input?: string | File | PhotoObject | null, fallback = '/images/placeholder.png'): string => {
  if (!input) return fallback;
  if (typeof input === 'string') return input;
  if (input instanceof File) {
    if (typeof window !== 'undefined' && typeof URL !== 'undefined') return URL.createObjectURL(input);
    return fallback;
  }
  // object
  const path = input.url || input.src || input.path;
  if (!path) return fallback;
  try {
    const url = new URL(path);
    return url.toString();
  } catch (e) {
    return path.startsWith('/') ? path : `/${path}`;
  }
};

export const getAllPhotoUrls = (photos?: PhotoInput, fallback = '/images/placeholder.png'): string[] => {
  if (!photos) return [fallback];
  if (typeof photos === 'string' || photos instanceof File || !Array.isArray(photos)) {
    return [getPhotoUrl(photos as any, fallback)];
  }
  // array
  return photos.map(p => getPhotoUrl(p as any, fallback));
};

export default { getPhotoUrl, getAllPhotoUrls };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://parkapp-pi.vercel.app';

export const extractPhotoStrings = (photos: any): string[] => {
  if (!photos) return [];

  let list: any[] = [];

  if (Array.isArray(photos)) {
    list = photos;
  } else if (typeof photos === 'string') {
    const trimmed = photos.trim();
    if (!trimmed || trimmed === '[]' || trimmed === 'null' || trimmed === 'undefined') {
      return [];
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          list = parsed;
        } else if (typeof parsed === 'string') {
          list = [parsed];
        }
      } catch (e) {
        list = trimmed.slice(1, -1).split(',').map(s => s.replace(/^["']|["']$/g, '').trim());
      }
    } else if (trimmed.includes(',')) {
      list = trimmed.split(',').map(s => s.trim());
    } else {
      list = [trimmed];
    }
  }

  const result: string[] = [];
  for (const item of list) {
    if (typeof item === 'string') {
      const cleanItem = item.trim().replace(/^["']|["']$/g, '');
      if (cleanItem && cleanItem !== '[]' && cleanItem !== 'null' && cleanItem !== 'undefined') {
        result.push(cleanItem);
      }
    }
  }

  return result;
};

export const formatSinglePhotoUrl = (photoStr: string): string => {
  if (!photoStr) return '';
  if (photoStr.startsWith('http://') || photoStr.startsWith('https://') || photoStr.startsWith('data:')) {
    return photoStr;
  }
  return `${BASE_URL}${photoStr.startsWith('/') ? '' : '/'}${photoStr}`;
};

export const getPhotoUrl = (photos: any): string | null => {
  const extracted = extractPhotoStrings(photos);
  if (extracted.length === 0) return null;
  return formatSinglePhotoUrl(extracted[0]);
};

export const getAllPhotoUrls = (photos: any): string[] => {
  const extracted = extractPhotoStrings(photos);
  return extracted.map(formatSinglePhotoUrl);
};

export default { getPhotoUrl, getAllPhotoUrls, extractPhotoStrings, formatSinglePhotoUrl };


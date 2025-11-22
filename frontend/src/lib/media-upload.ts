const MEDIA_API_BASE = process.env.NEXT_PUBLIC_MEDIA_API_BASE ?? '';

export class MediaUploadError extends Error {}

export const uploadImage = async (file: File): Promise<string> => {
  if (!MEDIA_API_BASE) {
    throw new MediaUploadError('画像アップロード先が設定されていません');
  }
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${MEDIA_API_BASE.replace(/\/$/, '')}/uploads`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new MediaUploadError('画像のアップロードに失敗しました');
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    throw new MediaUploadError('アップロード結果のURLが取得できませんでした');
  }
  return data.url;
};

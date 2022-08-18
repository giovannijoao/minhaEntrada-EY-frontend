const mediaUrl = process.env.NEXT_PUBLIC_CMS_URL_MEDIA || '';
const cmsUrl = process.env.CMS_API_URL || "http://127.0.0.1:1337/api";
export { mediaUrl, cmsUrl };
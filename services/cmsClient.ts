import axios from "axios"
const cmsClient = axios.create({
  baseURL:
    process.env.CMS_API_URL || "http://127.0.0.1:1337/api",
  headers: {
    Authorization: process.env.CMS_API_AUTHORIZATION || ''
  }
});

export default cmsClient;

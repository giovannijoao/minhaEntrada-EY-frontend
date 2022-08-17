import axios from "axios"
import { cmsUrl } from "../config";
const cmsClient = axios.create({
  baseURL: cmsUrl,
  headers: {
    Authorization: process.env.CMS_API_AUTHORIZATION || "",
  },
});

export default cmsClient;

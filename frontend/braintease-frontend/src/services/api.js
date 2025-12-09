import axios from "axios";

// Point this to your Django backend later
const API_BASE = "http://localhost:8000/api/";

export const api = axios.create({
  baseURL: API_BASE,
});

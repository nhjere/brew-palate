import axios from 'axios';
import supabase from '../supabaseClient.js';

// Axios instance for the FastAPI recommender. Attaches the signed-in user's
// Supabase access token, which the recommender requires on user endpoints.
const recommenderClient = axios.create({
  baseURL: import.meta.env.VITE_RECOMMENDATION_BASE_URL,
});

recommenderClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default recommenderClient;

import axios from "axios";

const api = axios.create({
  baseURL: "https://perinephral-overfree-mable.ngrok-free.dev/",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export default api;

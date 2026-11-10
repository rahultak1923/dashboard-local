// src/api.js
// Agar local Wi-Fi pe chalana ho toh 'localhost' ki jagah apna PC ka IP address dalein (e.g. http://192.168.1.15:5000)
// export const BASE_URL = `http://${window.location.hostname}:5000/api`;
export const BASE_URL = "https://localdashboad-backend.onrender.com/api";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Kuch galat ho gaya");
  }

  return data;
};
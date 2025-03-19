// API utility functions

// Base URL for the API
const API_BASE_URL = "https://playlist-backend.tech/service"

// Get the auth token from localStorage
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// API request helper with authentication
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

// API functions for specific endpoints
export const fetchLanguages = () => {
  return apiRequest("/languages", { method: "GET" })
}

export const addLanguage = (name: string) => {
  return apiRequest("/languages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  })
}

export const fetchGenres = () => {
  return apiRequest("/genere", { method: "GET" })
}

export const addGenre = (name: string) => {
  return apiRequest("/genere", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  })
}

export const fetchArtists = () => {
  return apiRequest("/artists", { method: "GET" })
}

export const addArtist = (formData: FormData) => {
  return apiRequest("/artists", {
    method: "POST",
    body: formData,
    // Don't set Content-Type header as it will be set automatically for FormData
  })
}

export const addSong = (formData: FormData) => {
  return apiRequest("/song", {
    method: "POST",
    body: formData,
    // Don't set Content-Type header as it will be set automatically for FormData
  })
}

// Add this function to fetch songs with pagination
export const fetchSongs = (page = 1, limit = 10) => {
  return apiRequest(`/song/all?page=${page}&limit=${limit}`, { method: "GET" })
}

// Add a function to format duration from seconds to MM:SS
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}


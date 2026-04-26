const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "campus_placement_token";
const USER_KEY = "campus_placement_user";

export const storage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const normalizeErrors = (errors) => {
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => error.msg || error.message || String(error));
};

export class ApiClientError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, options = {}) {
  const token = options.token ?? storage.getToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  let payload = null;
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    payload = await response.json();
  } catch {
    throw new ApiClientError(
      "Unable to reach the backend. Check that the API server is running.",
      0
    );
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiClientError(
      payload?.message || "Request failed.",
      response.status,
      normalizeErrors(payload?.errors)
    );
  }

  return payload?.data ?? payload;
}

export const api = {
  login: (body) => apiRequest("/auth/login", { method: "POST", body }),
  registerStudent: (body) =>
    apiRequest("/auth/register/student", { method: "POST", body }),
  registerRecruiter: (body) =>
    apiRequest("/auth/register/recruiter", { method: "POST", body }),
  me: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  studentProfile: () => apiRequest("/students/me"),
  availableJobs: () => apiRequest("/students/jobs/available"),
  publicJob: (id) => apiRequest(`/jobs/${id}`),
  applyToJob: (jobId) =>
    apiRequest("/applications", { method: "POST", body: { jobId } }),
  myApplications: () => apiRequest("/students/me/applications"),
  deleteApplication: (id) =>
    apiRequest(`/students/me/applications/${id}`, { method: "DELETE" }),
  slotsForJob: (jobId, available = false) =>
    apiRequest(`/slots/job/${jobId}${available ? "?available=true" : ""}`),
  bookSlot: (slotId, applicationId) =>
    apiRequest(`/slots/${slotId}/book`, {
      method: "POST",
      body: { applicationId }
    }),

  recruiterProfile: () => apiRequest("/recruiters/me"),
  recruiterJobs: () => apiRequest("/recruiters/jobs"),
  recruiterJob: (id) => apiRequest(`/recruiters/jobs/${id}`),
  createJob: (body) =>
    apiRequest("/recruiters/jobs", { method: "POST", body }),
  updateJob: (id, body) =>
    apiRequest(`/recruiters/jobs/${id}`, { method: "PUT", body }),
  deleteJob: (id) =>
    apiRequest(`/recruiters/jobs/${id}`, { method: "DELETE" }),
  recruiterApplications: () => apiRequest("/applications/recruiter/all"),
  applicationsForJob: (jobId) =>
    apiRequest(`/applications/recruiter/job/${jobId}`),
  updateApplicationStatus: (id, status) =>
    apiRequest(`/applications/${id}/status`, {
      method: "PUT",
      body: { status }
    }),
  createSlot: (body) => apiRequest("/slots", { method: "POST", body }),
  updateSlot: (id, body) =>
    apiRequest(`/slots/${id}`, { method: "PUT", body }),
  deleteSlot: (id) => apiRequest(`/slots/${id}`, { method: "DELETE" })
};

export const applicationStatuses = [
  "APPLIED",
  "SHORTLISTED",
  "REJECTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "OFFERED",
  "HIRED"
];

export const jobTypes = ["Internship", "Full Time", "Part Time", "Contract"];

export const programs = ["BSCS", "BSSE", "BSIT", "BBA", "BSDS", "BSEE"];

export const formatDateTime = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  }).format(new Date(value));
};

export const formatStatus = (status) =>
  status
    ? status
        .split("_")
        .map((part) => part[0] + part.slice(1).toLowerCase())
        .join(" ")
    : "Unknown";

export const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const toDatetimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const fromDatetimeLocalValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString();
};

export const deadlineIsOpen = (deadline) => new Date(deadline) > new Date();

export const getApplicationForJob = (applications, jobId) =>
  applications.find((application) => application.jobId === Number(jobId));

import { api } from "./api";

// Excel (.xlsx) export of website submissions — one sheet per inquiry type.
// Data is always fetched fresh from the API at click time, so the file holds
// every record (not just the filter shown on screen). The library is loaded
// only when someone actually exports, so it doesn't slow the admin down.

const fmtList = (v) => (Array.isArray(v) ? v.filter(Boolean).join(", ") : v ?? "");

// Uploaded files → one link per line (Excel shows them in the cell).
const fileLinks = (...lists) =>
  lists
    .flatMap((l) => (Array.isArray(l) ? l : l ? [l] : []))
    .map((f) => (typeof f === "string" ? f : f?.url))
    .filter(Boolean)
    .join("\n");

const PARTNER_TYPES = { parking: "Parking partner", service: "Service partner" };

// Columns shared by every sheet (first) and at the end.
const LEAD = [
  { header: "Submitted on", width: 20, value: (r) => (r.createdAt ? new Date(r.createdAt) : null), date: true },
  { header: "Status", width: 12, value: (r) => r.status },
  { header: "Full name", width: 24, value: (r) => r.fullName },
  { header: "Email", width: 30, value: (r) => r.email },
  { header: "Phone", width: 18, value: (r) => r.phone },
];
const TAIL = [
  { header: "Submitted from", width: 22, value: (r) => r.source },
  { header: "Last updated", width: 20, value: (r) => (r.updatedAt ? new Date(r.updatedAt) : null), date: true },
  { header: "Record ID", width: 26, value: (r) => r._id },
];

export const INQUIRY_EXPORTS = {
  quotes: {
    sheet: "Quotes",
    load: () => api.quotes().then((d) => d.quotes ?? []),
    columns: [
      { header: "Service", width: 24, value: (r) => r.service },
      { header: "Tower / project", width: 22, value: (r) => r.tower },
      { header: "Parking slots", width: 14, value: (r) => r.slots },
      { header: "Message", width: 50, value: (r) => r.message },
      { header: "Attachments", width: 40, value: (r) => fileLinks(r.attachments) },
    ],
  },
  proposals: {
    sheet: "Proposals",
    load: () => api.proposals().then((d) => d.proposals ?? []),
    columns: [
      { header: "Company", width: 24, value: (r) => r.company },
      { header: "Solutions of interest", width: 30, value: (r) => fmtList(r.solutions) },
      { header: "Message", width: 50, value: (r) => r.message },
      { header: "Attachments", width: 40, value: (r) => fileLinks(r.attachments) },
    ],
  },
  consultations: {
    sheet: "Consultations",
    load: () => api.consultations().then((d) => d.consultations ?? []),
    columns: [
      { header: "Company", width: 24, value: (r) => r.company },
      { header: "Topics", width: 30, value: (r) => fmtList(r.topics) },
      { header: "Preferred time", width: 20, value: (r) => r.preferredTime },
      { header: "Message", width: 50, value: (r) => r.message },
    ],
  },
  partnerRequests: {
    sheet: "Partner Requests",
    load: () => api.partnerRequests().then((d) => d.partnerRequests ?? []),
    columns: [
      { header: "Partner type", width: 18, value: (r) => PARTNER_TYPES[r.partnerType] || "Not specified" },
      { header: "Company", width: 24, value: (r) => r.companyName },
      { header: "Message", width: 50, value: (r) => r.message },
      { header: "Documents", width: 40, value: (r) => fileLinks(r.documents, r.document) },
    ],
  },
  jobApplications: {
    sheet: "Job Applications",
    load: () => api.jobApplications().then((d) => d.applications ?? []),
    columns: [
      { header: "Position", width: 26, value: (r) => r.jobTitle },
      { header: "Department", width: 18, value: (r) => r.department },
      { header: "Location", width: 18, value: (r) => r.location },
      { header: "LinkedIn", width: 34, value: (r) => r.linkedIn },
      { header: "Resume / CV", width: 40, value: (r) => r.resumeUrl },
      { header: "Date of birth", width: 14, value: (r) => (r.birthDate ? new Date(r.birthDate) : null), date: "dd/mm/yyyy" },
      { header: "Heard about us via", width: 20, value: (r) => r.hearAbout },
      { header: "Message", width: 50, value: (r) => r.message },
    ],
  },
  contacts: {
    sheet: "Contact Submissions",
    load: () => api.contacts().then((d) => d.contacts ?? []),
    columns: [
      { header: "Company", width: 24, value: (r) => r.company },
      { header: "Subject", width: 26, value: (r) => r.subject },
      { header: "Message", width: 50, value: (r) => r.message },
      { header: "Attachments", width: 40, value: (r) => fileLinks(r.attachments) },
    ],
  },
};

export const ALL_INQUIRY_TYPES = Object.keys(INQUIRY_EXPORTS);

function toCell(col, record) {
  const raw = col.value(record);
  if (raw === null || raw === undefined || raw === "") return null;
  if (col.date) {
    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime())) return { value: String(raw), type: String };
    return { value: d, type: Date, format: typeof col.date === "string" ? col.date : "dd/mm/yyyy hh:mm" };
  }
  // Everything else as text — keeps phone numbers' leading "+" / zeros intact.
  const text = String(raw);
  return { value: text, type: String, wrap: text.includes("\n") || text.length > 60 };
}

export function buildSheet(type, records) {
  const cfg = INQUIRY_EXPORTS[type];
  const columns = [...LEAD, ...cfg.columns, ...TAIL];
  const header = columns.map((c) => ({
    value: c.header,
    fontWeight: "bold",
    backgroundColor: "#E8F3FF",
  }));
  const rows = records.map((r) => columns.map((c) => toCell(c, r)));
  return {
    data: [header, ...rows],
    sheet: cfg.sheet,
    columns: columns.map((c) => ({ width: c.width })),
    stickyRowsCount: 1,
  };
}

const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * Fetch the given inquiry types and download them as one .xlsx file
 * (one sheet per type). Returns the number of records exported.
 */
export async function exportInquiries(types = ALL_INQUIRY_TYPES, fileLabel = "Inquiries") {
  const [{ default: writeExcelFile }, lists] = await Promise.all([
    import("write-excel-file/browser"),
    Promise.all(types.map((t) => INQUIRY_EXPORTS[t].load())),
  ]);
  const sheets = types.map((t, i) => buildSheet(t, lists[i]));
  const name = `HalaPark-${fileLabel.replace(/\s+/g, "-")}-${today()}.xlsx`;
  await writeExcelFile(sheets).toFile(name);
  return lists.reduce((n, l) => n + l.length, 0);
}

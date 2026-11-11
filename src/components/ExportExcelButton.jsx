import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { exportInquiries, ALL_INQUIRY_TYPES } from "../lib/exportExcel";

// "Export to Excel" — downloads the given submission types as an .xlsx file
// (one sheet per type, every record, fetched fresh at click time).
export default function ExportExcelButton({ types = ALL_INQUIRY_TYPES, fileLabel = "Inquiries", label = "Export to Excel" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      await exportInquiries(types, fileLabel);
    } catch (err) {
      setError(err?.message || "Export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
        {busy ? "Preparing…" : label}
      </button>
      {error ? <p className="text-xs font-medium text-red-600" role="alert">{error}</p> : null}
    </div>
  );
}

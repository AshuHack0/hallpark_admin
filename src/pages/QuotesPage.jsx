import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Quotes — HalaPark Admin";
    api
      .quotes()
      .then((data) => setQuotes(data.quotes ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading quotes…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#050A13]">Quotes</h2>
      <p className="mt-1 text-sm text-slate-500">
        Service quote requests from the website
      </p>

      {quotes.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No quotes yet. Submissions will appear here once the frontend posts to the backend API.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote._id ?? quote.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#050A13]">{quote.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{quote.email}</td>
                  <td className="px-4 py-3 text-slate-600">{quote.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{quote.service}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {Array.isArray(quote.attachments) && quote.attachments.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {quote.attachments.map((file, index) => (
                          <a
                            key={`${file?.url}-${index}`}
                            href={file?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-[180px] truncate text-xs font-medium text-[#0088FF] hover:underline"
                            title={file?.name || file?.url}
                          >
                            {file?.name || `File ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#EEF6FF] px-2.5 py-1 text-xs font-semibold text-[#0088FF]">
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(quote.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

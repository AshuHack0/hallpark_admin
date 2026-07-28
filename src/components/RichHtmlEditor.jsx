import { Editor } from "@tinymce/tinymce-react";

// Self-hosted TinyMCE (no cloud API key). Everything the editor needs is
// imported from the npm package so it works fully offline in the Vite build.
import "tinymce/tinymce";
import "tinymce/models/dom/model";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/plugins/lists";
import "tinymce/plugins/advlist";
import "tinymce/plugins/link";
import "tinymce/plugins/autolink";
import "tinymce/plugins/table";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/wordcount";
import "tinymce/skins/ui/oxide/skin.min.css";

// Rich HTML editor for long-form documents (legal pages). Stores HTML.
// `rtl` flips the editing direction for Arabic content.
export default function RichHtmlEditor({ value, onChange, rtl = false, height = 480, placeholder }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 [&_.tox-tinymce]:!border-0">
      <Editor
        licenseKey="gpl"
        value={value ?? ""}
        onEditorChange={(html) => onChange(html)}
        init={{
          height,
          menubar: false,
          plugins: "lists advlist link autolink table searchreplace wordcount",
          toolbar:
            "undo redo | blocks | bold italic underline | forecolor | bullist numlist | link table | alignleft aligncenter alignright | removeformat",
          placeholder,
          directionality: rtl ? "rtl" : "ltr",
          branding: false,
          statusbar: true,
          elementpath: false,
          // Skin CSS is imported above; keep TinyMCE from fetching it itself.
          skin: false,
          content_css: false,
          content_style: `
            body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.7; color: #1e293b; margin: 12px; ${rtl ? "direction: rtl; text-align: right;" : ""} }
            h1,h2,h3 { color: #050A13; }
            a { color: #0088FF; }
          `,
        }}
      />
    </div>
  );
}

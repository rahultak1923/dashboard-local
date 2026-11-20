import React, { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import { ArrowLeft, Upload, Save, Image as ImageIcon, Newspaper } from "lucide-react";
import { T, bodyFont, displayFont, cardStyle, primaryBtn, PageHeader } from "../theme";
import { BLOG_SCRIPT_URL } from "./BlogsPage";

export const formatDriveImage = (url) => {
  if (!url) return "";
  const clean = String(url).trim().replace(/^['"]|['"]$/g, "");
  const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
  }
  return clean;
};

export default function BlogEditorPage({ currentUser, editingBlog, onBack, onSaveSuccess }) {
  const [title, setTitle] = useState(editingBlog?.title || "");
  const [description, setDescription] = useState(editingBlog?.description || "");
  const [status, setStatus] = useState(editingBlog?.status || "Active");

  // Banner Image (Detail page ke liye)
  const [imagePreview, setImagePreview] = useState(
    editingBlog?.image ? formatDriveImage(editingBlog.image) : ""
  );
  const [imageFile, setImageFile] = useState(null);

  // Thumbnail Image (Blogs listing & Home page ke liye)
  const [thumbPreview, setThumbPreview] = useState(
    editingBlog?.thumbnail ? formatDriveImage(editingBlog.thumbnail) : ""
  );
  const [thumbFile, setThumbFile] = useState(null);

  // News Section Fields
  const [newsTitle, setNewsTitle] = useState(editingBlog?.newsTitle || "");
  const [newsDescription, setNewsDescription] = useState(editingBlog?.newsDescription || "");

  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef(null);

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 460,
      cleanHTML: {
        fillEmptyParagraph: false,
        removeEmptyElements: false,
        replaceNBSP: false,
      },
      askBeforePasteHTML: false,
      defaultActionOnPaste: "insert_as_html",
      placeholder:
        "Write your full blog post here... Toolbar se H1-H4 headings, Bold, Underline, Interlink URLs, Lists aur Tables add karein.",
      toolbarAdaptive: false,
      buttons: [
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "unlink",
        "table",
        "image",
        "|",
        "align",
        "fontsize",
        "brush",
        "|",
        "hr",
        "eraser",
        "undo",
        "redo",
        "source",
      ],
      controls: {
        paragraph: {
          list: {
            p: "Normal Paragraph (P)",
            h1: "Heading 1 (H1)",
            h2: "Heading 2 (H2)",
            h3: "Heading 3 (H3)",
            h4: "Heading 4 (H4)",
            blockquote: "Quote",
          },
        },
      },
    }),
    []
  );

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Banner image size 5MB se kam honi chahiye.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Thumbnail image size 5MB se kam honi chahiye.");
      return;
    }
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Blog title likhna zaroori hai.");
      return;
    }
    if (!description.trim() || description === "<p><br></p>") {
      alert("Blog description likhna zaroori hai.");
      return;
    }
    if (!editingBlog && !imageFile && !imagePreview) {
      alert("Featured Banner Image upload karein.");
      return;
    }
    if (!editingBlog && !thumbFile && !thumbPreview) {
      alert("Thumbnail Image upload karein.");
      return;
    }

    try {
      setSubmitting(true);

      let imageBase64 = "";
      let fileName = "";
      let mimeType = "";
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        fileName = imageFile.name;
        mimeType = imageFile.type;
      }

      let thumbnailBase64 = "";
      let thumbFileName = "";
      let thumbMimeType = "";
      if (thumbFile) {
        thumbnailBase64 = await fileToBase64(thumbFile);
        thumbFileName = thumbFile.name;
        thumbMimeType = thumbFile.type;
      }

      const payload = {
        action: editingBlog ? "update" : "create",
        id: editingBlog ? editingBlog.id : undefined,
        title: title.trim(),
        description,
        status,
        author: currentUser?.name || "Team Member",
        imageBase64,
        fileName,
        mimeType,
        imageUrl: editingBlog ? editingBlog.image : "",
        thumbnailBase64,
        thumbFileName,
        thumbMimeType,
        thumbnailUrl: editingBlog ? editingBlog.thumbnail : "",
        newsTitle: newsTitle.trim(),
        newsDescription: newsDescription.trim(),
      };

      const res = await fetch(BLOG_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        onSaveSuccess();
      } else {
        alert(result.message || "Blog save karne me problem aayi.");
      }
    } catch (err) {
      alert("Error saving blog: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: "100%", padding: "0 10px 50px 10px", fontFamily: bodyFont }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "8px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              fontSize: 13,
              color: T.text,
            }}
          >
            <ArrowLeft size={16} /> Back to Blogs
          </button>

          <PageHeader
            title={editingBlog ? "Edit Blog Post" : "Create & Publish New Blog"}
            subtitle="Banner image, Thumbnail image, Rich Blog Content aur News section details fill karein"
          />
        </div>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        style={cardStyle({
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        })}
      >
        {/* Row 1: Title & Publish Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: T.text }}>
              Blog Title *
            </label>
            <input
              type="text"
              required
              placeholder="Enter blog headline..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                fontSize: 15,
                fontFamily: displayFont,
                fontWeight: 600,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: T.text }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                fontSize: 14,
                fontFamily: bodyFont,
                background: "#fff",
              }}
            >
              <option value="Active">Active (Live on Website)</option>
              <option value="Draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Two Images Side-by-Side (Banner Image + Thumbnail Image) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {/* Box 1: Featured Banner Image (Detail Page) */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>
              1. Featured Banner Image (Blog Detail Page ke liye) *
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 14,
                background: T.bg,
                borderRadius: 12,
                border: `1px dashed ${T.border}`,
                minHeight: 90,
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  background: T.surface,
                  border: `1px solid ${T.primary}`,
                  borderRadius: 9,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.primary,
                }}
              >
                <Upload size={15} /> {imageFile ? imageFile.name : "Upload Banner"}
                <input type="file" accept="image/*" onChange={handleBannerChange} style={{ display: "none" }} />
              </label>

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Banner Preview"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (editingBlog?.image && e.target.src !== editingBlog.image) {
                      e.target.src = editingBlog.image;
                    }
                  }}
                  style={{ height: 70, width: 125, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }}
                />
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.textFaint, fontSize: 12.5 }}>
                  <ImageIcon size={16} /> Wide banner image
                </span>
              )}
            </div>
          </div>

          {/* Box 2: Thumbnail Image (Blogs Listing & Home Page) */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>
              2. Thumbnail Image (Blogs Page & Home Page ke liye) *
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 14,
                background: T.bg,
                borderRadius: 12,
                border: `1px dashed ${T.border}`,
                minHeight: 90,
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  background: T.surface,
                  border: `1px solid ${T.primary}`,
                  borderRadius: 9,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.primary,
                }}
              >
                <Upload size={15} /> {thumbFile ? thumbFile.name : "Upload Thumbnail"}
                <input type="file" accept="image/*" onChange={handleThumbChange} style={{ display: "none" }} />
              </label>

              {thumbPreview ? (
                <img
                  src={thumbPreview}
                  alt="Thumbnail Preview"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (editingBlog?.thumbnail && e.target.src !== editingBlog.thumbnail) {
                      e.target.src = editingBlog.thumbnail;
                    }
                  }}
                  style={{ height: 70, width: 125, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }}
                />
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: T.textFaint, fontSize: 12.5 }}>
                  <ImageIcon size={16} /> Card thumbnail
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: News Section Fields (News Title & News Description) */}
        <div
          style={{
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontWeight: 700, fontSize: 14.5, color: T.primary }}>
            <Newspaper size={17} /> News Section Details (News Feed par dikhane ke liye)
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: T.text }}>
              News Title
            </label>
            <input
              type="text"
              placeholder="Enter short news headline (click karne par yahi blog open hoga)..."
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 9,
                border: `1px solid ${T.border}`,
                fontSize: 13.5,
                fontFamily: bodyFont,
                background: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: T.text }}>
              News Description
            </label>
            <textarea
              rows={3}
              placeholder="Enter short news summary / excerpt..."
              value={newsDescription}
              onChange={(e) => setNewsDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 9,
                border: `1px solid ${T.border}`,
                fontSize: 13.5,
                fontFamily: bodyFont,
                background: "#fff",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Row 4: Full-Width Rich Text Editor */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>
            Blog Description (H1–H4, Paragraph, Bold, Underline, Interlink URL, Lists & Tables) *
          </label>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
            <JoditEditor
              ref={editorRef}
              value={description}
              config={editorConfig}
              onBlur={(newContent) => setDescription(newContent)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "11px 20px",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: T.bg,
              color: T.text,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...primaryBtn,
              padding: "11px 26px",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {submitting
              ? "Uploading Images & Saving..."
              : editingBlog
              ? "Update Blog Post"
              : "Publish Blog Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
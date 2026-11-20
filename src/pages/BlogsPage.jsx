import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  X,
  Eye,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { T, bodyFont, displayFont, monoFont, cardStyle, primaryBtn, PageHeader } from "../theme";
import { formatDriveImage } from "./BlogEditorPage";

export const BLOG_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw_BwVlr--rrjFhPx--mnwXgHpxgV2sLH4foZtyKfCQRGfjvL6LewY7GiPg9DUdE49T/exec";

// Sheet ke headers (Title vs title, Image vs ImageURL) ko normalize karne wala helper
const normalizeBlog = (raw) => {
  const getVal = (...keys) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== "") return raw[k];
      const foundKey = Object.keys(raw).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
      if (foundKey && raw[foundKey] !== undefined && raw[foundKey] !== "") return raw[foundKey];
    }
    return "";
  };

  return {
    id: getVal("id", "blogId", "blog_id"),
    title: getVal("title", "blogTitle", "heading"),
    description: getVal("description", "content", "desc", "body"),
    image: getVal("image", "imageUrl", "image_url", "photo", "cover"),
    thumbnail: getVal("thumbnail", "thumb", "thumbnailUrl") || getVal("image", "imageUrl"),
    newsTitle: getVal("newsTitle", "news_title"),
    newsDescription: getVal("newsDescription", "news_description"),
    status: String(getVal("status") || "Active").trim(),
    author: getVal("author", "authorName", "createdBy") || "Admin",
    createdAt: getVal("createdAt", "date", "timestamp"),
  };
};

export default function BlogsPage({ onNavigateCreate, onNavigateEdit }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [previewBlog, setPreviewBlog] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(BLOG_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlogs(data.map(normalizeBlog));
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);
  // Article Preview Modal mein FAQ Accordion (faq-question-btn) chalane ke liye
  useEffect(() => {
    const handleFaqClick = (e) => {
      const btn = e.target.closest(".faq-question-btn");
      if (!btn) return;

      e.preventDefault();
      const faqItem = btn.closest(".faq-item");
      if (!faqItem) return;

      const answerEl = faqItem.querySelector('[id^="faq-answer-"]') || btn.nextElementSibling;
      const iconEl = faqItem.querySelector('[id^="faq-icon-"]');
      if (!answerEl) return;

      const isOpen = answerEl.style.maxHeight && answerEl.style.maxHeight !== "0px";

      if (isOpen) {
        answerEl.style.maxHeight = "0px";
        if (iconEl) {
          iconEl.innerText = "+";
          iconEl.style.background = "rgba(0,82,255,0.05)";
          iconEl.style.color = "#0052ff";
        }
        faqItem.style.borderColor = "#dbeafe";
      } else {
        answerEl.style.maxHeight = answerEl.scrollHeight + "px";
        if (iconEl) {
          iconEl.innerText = "×";
          iconEl.style.background = "#0052ff";
          iconEl.style.color = "#ffffff";
        }
        faqItem.style.borderColor = "#0052ff";
      }
    };

    document.addEventListener("click", handleFaqClick);
    return () => document.removeEventListener("click", handleFaqClick);
  }, []);

  const handleDeleteBlog = async (blog) => {
    if (!window.confirm(`Kya aap "${blog.title || "this"}" blog ko delete karna chahte hain?`)) return;

    try {
      setLoading(true);
      const res = await fetch(BLOG_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "delete",
          id: blog.id,
        }),
      });
      const result = await res.json();
      if (result.success) {
        fetchBlogs();
      } else {
        alert("Delete failed: " + (result.message || "Unknown error"));
        setLoading(false);
      }
    } catch (err) {
      alert("Error deleting blog: " + err.message);
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div style={{ width: "100%", padding: "0 10px 40px 10px", fontFamily: bodyFont }}>
      {/* Top Header & Actions */}
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
        <PageHeader
          title={`Blogs Management (${blogs.length})`}
          subtitle="Google Sheet & Drive par blogs upload, edit aur website ke liye publish karein"
        />

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={fetchBlogs}
            style={{
              ...primaryBtn,
              background: T.surface,
              color: T.text,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={onNavigateCreate}
            style={{
              ...primaryBtn,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={16} /> Upload New Blog
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={cardStyle({
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        })}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Active", "Draft"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                background: statusFilter === st ? T.primary : T.bg,
                color: statusFilter === st ? "#fff" : T.textSoft,
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 9,
            padding: "7px 12px",
            width: "100%",
            maxWidth: 300,
          }}
        >
          <Search size={15} color={T.textFaint} />
          <input
            type="text"
            placeholder="Search blog title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              fontSize: 13,
              color: T.text,
            }}
          />
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: T.textFaint }}>
          Google Sheet se blogs load ho rahe hain...
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div style={cardStyle({ padding: 50, textAlign: "center", color: T.textFaint })}>
          Koi blog nahi mila. "Upload New Blog" par click karke pehla blog publish karein!
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: 18,
          }}
        >
          {filteredBlogs.map((blog, idx) => {
            const imgUrl = formatDriveImage(blog.image);
            const isActive = blog.status.toLowerCase() === "active";
            return (
              <div
                key={blog.id || idx}
                style={cardStyle({
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: `1px solid ${T.border}`,
                })}
              >
                <div>
                  {/* Featured Image */}
                  <div style={{ position: "relative", height: 190, background: T.bg }}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={blog.title || "Blog Cover"}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (blog.image && e.target.src !== blog.image) {
                            e.target.src = blog.image;
                          } else {
                            e.target.style.display = "none";
                          }
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: T.textFaint,
                        }}
                      >
                        <FileText size={32} />
                      </div>
                    )}

                    {/* Status Badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: monoFont,
                        background: isActive ? T.goodSoft : T.warnSoft,
                        color: isActive ? T.good : T.warn,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {blog.status || "Active"}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: T.textFaint,
                        fontFamily: monoFont,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <User size={11} /> {blog.author || "Admin"}
                      </span>
                      <span>•</span>
                      <span>
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recent"}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: displayFont,
                        fontSize: 16.5,
                        fontWeight: 700,
                        color: T.text,
                        margin: "0 0 8px 0",
                        lineHeight: 1.35,
                      }}
                    >
                      {blog.title || "Untitled Blog"}
                    </h3>

                    <p
                      style={{
                        fontSize: 13,
                        color: T.textSoft,
                        margin: 0,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {stripHtml(blog.description)}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: `1px solid ${T.border}`,
                    background: T.bg,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <button
                    onClick={() => setPreviewBlog(blog)}
                    style={{
                      border: `1px solid ${T.border}`,
                      background: T.surface,
                      color: T.text,
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Eye size={13} color={T.primary} /> Preview
                  </button>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onNavigateEdit(blog)}
                      style={{
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        color: T.primary,
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteBlog(blog)}
                      style={{
                        border: "none",
                        background: T.badSoft,
                        color: T.bad,
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Article Preview Modal */}
      {previewBlog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: T.surface,
              borderRadius: 16,
              width: "100%",
              maxWidth: 780,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: T.shadowLg,
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: T.surface,
              }}
            >
              <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 15 }}>Article Preview</span>
              <button
                onClick={() => setPreviewBlog(null)}
                style={{
                  border: "none",
                  background: T.bg,
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {previewBlog.image && (
                <img
                  src={formatDriveImage(previewBlog.image)}
                  alt={previewBlog.title}
                  referrerPolicy="no-referrer"
                  style={{
                    width: "100%",
                    maxHeight: 340,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 18,
                  }}
                />
              )}
              <h1 style={{ fontFamily: displayFont, fontSize: 24, margin: "0 0 10px 0", color: T.text }}>
                {previewBlog.title}
              </h1>
              <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 20, fontFamily: monoFont }}>
                By {previewBlog.author || "Admin"} • Status: {previewBlog.status}
              </div>

              <div
                style={{ fontSize: 15, lineHeight: 1.7, color: T.text }}
                dangerouslySetInnerHTML={{ __html: previewBlog.description }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
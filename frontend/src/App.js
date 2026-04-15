import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://dev160235-neuroscan-backend.hf.space";

const CLASS_COLORS = {
  glioma:     { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
  meningioma: { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  notumor:    { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  pituitary:  { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
};

const SEVERITY_COLORS = {
  High:     { bg: "#fef2f2", text: "#991b1b" },
  Moderate: { bg: "#fff7ed", text: "#9a3412" },
  None:     { bg: "#f0fdf4", text: "#166534" },
};

const TEAM = [
  "Dev Khilan Patel",
  "Mohammad Fawzaan Khan Juhoor",
  "Deep Atul Patel",
  "Khush Sanjay Santoki",
];

export default function App() {
  const [demoImages, setDemoImages]       = useState([]);
  const [selectedDemo, setSelectedDemo]   = useState(null);
  const [uploadedFile, setUploadedFile]   = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [result, setResult]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [activeTab, setActiveTab]         = useState("demo");

  useEffect(() => {
    axios.get(`${API}/demo-images-list`).then((r) => setDemoImages(r.data.images));
  }, []);

  const runDemo = async (filename) => {
    setSelectedDemo(filename);
    setResult(null);
    setLoading(true);
    try {
      const r = await axios.get(`${API}/demo-predict/${filename}`);
      setResult(r.data);
    } catch { alert("Backend not responding."); }
    setLoading(false);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    setUploadedFile(f);
    setResult(null);
    if (f) setUploadPreview(URL.createObjectURL(f));
  };

  const runUpload = async () => {
    if (!uploadedFile) return;
    setResult(null);
    setLoading(true);
    const fd = new FormData();
    fd.append("file", uploadedFile);
    try {
      const r = await axios.post(`${API}/predict`, fd);
      setResult(r.data);
    } catch { alert("Backend not responding."); }
    setLoading(false);
  };

  const labelOf = (cls) =>
    cls === "notumor" ? "No tumor" : cls.charAt(0).toUpperCase() + cls.slice(1);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fb; }
        .nav { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0 24px; height: 54px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .nav-brand { font-weight: 700; font-size: 16px; color: #111827; letter-spacing: -0.3px; }
        .nav-badges { display: flex; gap: 8px; align-items: center; }
        .badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; border: 1px solid; white-space: nowrap; }
        .badge-gray { color: #6b7280; background: #f3f4f6; border-color: #e5e7eb; }
        .badge-green { color: #166534; background: #f0fdf4; border-color: #bbf7d0; font-weight: 500; }
        .wrapper { max-width: 1100px; margin: 0 auto; padding: 32px 16px; }
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: clamp(20px, 4vw, 26px); font-weight: 700; color: #111827; letter-spacing: -0.5px; margin-bottom: 6px; }
        .page-sub { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; }
        .stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .stat-value { font-size: 13px; font-weight: 600; color: #111827; }
        .tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
        .tab-btn { padding: 10px 18px; border: none; background: none; cursor: pointer; font-size: 14px; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; color: #6b7280; }
        .tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 600; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .card-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .demo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        @media (max-width: 768px) { .demo-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px) { .demo-grid { grid-template-columns: repeat(2, 1fr); } }
        .demo-item { border-radius: 8px; overflow: hidden; cursor: pointer; border: 1.5px solid #e5e7eb; background: #f9fafb; transition: border-color 0.15s; }
        .demo-item.selected { border-color: #4f46e5; }
        .demo-item img { width: 100%; height: 100px; object-fit: cover; display: block; }
        .demo-item-footer { padding: 5px 8px; display: flex; justify-content: space-between; align-items: center; }
        .demo-item-label { font-size: 10px; font-weight: 500; color: #374151; }
        .demo-dot { width: 5px; height: 5px; border-radius: 50%; background: #4f46e5; }
        .upload-zone { border: 1.5px dashed #d1d5db; border-radius: 10px; padding: 36px 20px; cursor: pointer; text-align: center; background: #fafafa; margin-bottom: 14px; display: block; }
        .upload-icon { width: 36px; height: 36px; border-radius: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .upload-title { font-size: 14px; color: #374151; font-weight: 500; margin-bottom: 3px; }
        .upload-sub { font-size: 12px; color: #9ca3af; }
        .upload-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .upload-filename { font-size: 13px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
        .btn-primary { background: #4f46e5; color: #fff; border: none; padding: 9px 20px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .btn-primary:disabled { opacity: 0.6; }
        .loading-box { text-align: center; padding: 40px 20px; }
        .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; margin: 0 auto 14px; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-title { font-size: 14px; color: #374151; font-weight: 500; margin-bottom: 4px; }
        .loading-sub { font-size: 12px; color: #9ca3af; }
        .results-grid { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
        @media (max-width: 768px) { .results-grid { grid-template-columns: 1fr; } }
        .diag-title { font-size: clamp(18px, 3vw, 22px); font-weight: 700; color: #111827; margin-bottom: 6px; }
        .diag-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .severity-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
        .diag-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 18px; }
        .conf-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .conf-label { font-size: 12px; color: #6b7280; }
        .conf-value { font-size: 13px; font-weight: 600; color: #111827; }
        .progress-bg { height: 5px; background: #f3f4f6; border-radius: 3px; margin-bottom: 18px; }
        .progress-fill { height: 5px; border-radius: 3px; background: #4f46e5; transition: width 0.8s ease; }
        .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
        .bar-pill { font-size: 10px; font-weight: 500; padding: 2px 7px; border-radius: 4px; min-width: 72px; text-align: center; border: 1px solid; }
        .bar-bg { flex: 1; height: 4px; background: #f3f4f6; border-radius: 2px; }
        .bar-fill { height: 4px; border-radius: 2px; transition: width 0.8s ease; }
        .bar-pct { font-size: 11px; color: #6b7280; min-width: 36px; text-align: right; }
        .images-col { display: flex; flex-direction: column; gap: 14px; }
        .img-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
        .img-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .img-tag { font-size: 11px; color: #4f46e5; background: #eef2ff; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
        .scan-img { width: 100%; border-radius: 6px; display: block; object-fit: contain; max-height: 200px; background: #000; }
        .healthy-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 14px; }
        .healthy-icon { width: 36px; height: 36px; border-radius: 50%; background: #dcfce7; border: 1px solid #86efac; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .healthy-title { font-size: 14px; font-weight: 600; color: #166534; margin-bottom: 3px; }
        .healthy-sub { font-size: 13px; color: #16a34a; }
        footer { background: #fff; border-top: 1px solid #e5e7eb; padding: 24px 16px; margin-top: 20px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; margin-bottom: 16px; }
        .footer-brand { font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 4px; }
        .footer-disclaimer { font-size: 12px; color: #9ca3af; }
        .footer-team-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .footer-team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 20px; }
        .footer-team-name { font-size: 12px; color: #374151; font-weight: 500; }
        .footer-bottom { border-top: 1px solid #f3f4f6; padding-top: 14px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .footer-bottom-text { font-size: 11px; color: #d1d5db; }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <span className="nav-brand">NeuroScan</span>
        <div className="nav-badges">
          <span className="badge badge-gray">EfficientNet-B0</span>
          <span className="badge badge-green">98.31% accuracy</span>
        </div>
      </nav>

      <div className="wrapper">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Brain Tumor MRI Classifier</h1>
          <p className="page-sub">Select a demo scan or upload your own MRI image to get an AI-powered diagnosis with Grad-CAM explainability.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: "Model", value: "EfficientNet-B0" },
            { label: "Test accuracy", value: "98.31%" },
            { label: "Classes", value: "4 tumor types" },
            { label: "Explainability", value: "Grad-CAM" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {["demo", "upload"].map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => { setActiveTab(tab); setResult(null); }}>
              {tab === "demo" ? "Demo scans" : "Upload scan"}
            </button>
          ))}
        </div>

        {/* Demo */}
        {activeTab === "demo" && (
          <div className="card">
            <p className="card-label">Click any scan to analyze</p>
            <div className="demo-grid">
              {demoImages.map((img) => (
                <div key={img.filename} className={`demo-item ${selectedDemo === img.filename ? "selected" : ""}`}
                  onClick={() => runDemo(img.filename)}>
                  <img src={`${API}/demo-images/${img.filename}`} alt={img.label} />
                  <div className="demo-item-footer">
                    <span className="demo-item-label">{labelOf(img.label)}</span>
                    {selectedDemo === img.filename && <span className="demo-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload */}
        {activeTab === "upload" && (
          <div className="card">
            <label className="upload-zone">
              {uploadPreview
                ? <img src={uploadPreview} alt="preview" style={{ maxHeight: 180, borderRadius: 6, display: "block", margin: "0 auto" }} />
                : <>
                    <div className="upload-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p className="upload-title">Click to upload MRI image</p>
                    <p className="upload-sub">JPG or PNG</p>
                  </>
              }
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
            {uploadedFile && (
              <div className="upload-actions">
                <span className="upload-filename">{uploadedFile.name}</span>
                <button className="btn-primary" onClick={runUpload} disabled={loading}>
                  {loading ? "Analyzing..." : "Run analysis"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card loading-box">
            <div className="spinner" />
            <p className="loading-title">Running analysis</p>
            <p className="loading-sub">EfficientNet-B0 + Grad-CAM</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="results-grid">
            <div className="card">
              <p className="card-label">Diagnosis</p>
              <div className="diag-row">
                <span className="diag-title">{labelOf(result.predicted_class)}</span>
                <span className="severity-badge" style={{
                  background: SEVERITY_COLORS[result.class_info.severity].bg,
                  color: SEVERITY_COLORS[result.class_info.severity].text
                }}>{result.class_info.severity} severity</span>
              </div>
              <p className="diag-desc">{result.class_info.description}</p>
              <div className="conf-row">
                <span className="conf-label">Confidence</span>
                <span className="conf-value">{result.confidence}%</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${result.confidence}%` }} />
              </div>
              <p className="card-label">All classes</p>
              {Object.entries(result.probabilities).map(([cls, prob]) => (
                <div key={cls} className="bar-row">
                  <span className="bar-pill" style={{
                    background: CLASS_COLORS[cls].bg,
                    color: CLASS_COLORS[cls].text,
                    borderColor: CLASS_COLORS[cls].border
                  }}>{labelOf(cls)}</span>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{
                      width: `${prob}%`,
                      background: cls === result.predicted_class ? "#4f46e5" : "#d1d5db"
                    }} />
                  </div>
                  <span className="bar-pct">{prob}%</span>
                </div>
              ))}
            </div>

            <div className="images-col">
              <div className="img-card">
                <div className="img-card-header">
                  <p className="card-label" style={{ margin: 0 }}>Original scan</p>
                </div>
                <img src={`data:image/png;base64,${result.original}`} alt="scan" className="scan-img" />
              </div>

              {result.predicted_class !== "notumor" ? (
                <div className="img-card">
                  <div className="img-card-header">
                    <p className="card-label" style={{ margin: 0 }}>Grad-CAM heatmap</p>
                    <span className="img-tag">AI focus region</span>
                  </div>
                  <img src={`data:image/png;base64,${result.heatmap}`} alt="heatmap" className="scan-img" style={{ background: "transparent" }} />
                </div>
              ) : (
                <div className="healthy-box">
                  <div className="healthy-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="healthy-title">No tumor detected</p>
                    <p className="healthy-sub">Brain scan appears healthy.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <p className="footer-brand">NeuroScan</p>
              <p className="footer-disclaimer">For educational purposes only — not for clinical diagnosis</p>
            </div>
            <div>
              <p className="footer-team-label">Team</p>
              <div className="footer-team-grid">
                {TEAM.map((name) => (
                  <span key={name} className="footer-team-name">{name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-bottom-text">Deep Learning — Humber College</span>
            <span className="footer-bottom-text">EfficientNet-B0 · Grad-CAM · PyTorch · FastAPI · React</span>
          </div>
        </div>
      </footer>
    </>
  );
}
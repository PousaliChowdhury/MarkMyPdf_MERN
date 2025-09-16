import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import "../styles/pdfviewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer() {
  const { uuid } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const [pdfMeta, setPdfMeta] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [highlights, setHighlights] = useState([]);
  const [selectionMenu, setSelectionMenu] = useState(null);
  const [overlays, setOverlays] = useState([]);

  const [tool, setTool] = useState("highlighter"); // "highlighter", "pen", "eraser"
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);

  const [tempOverlay, setTempOverlay] = useState(null); // live preview while drawing

  function handleMouseDown(e) {
    if (tool === "highlighter" || tool === "pen") {
      setDrawing(true);
      const rect = containerRef.current.getBoundingClientRect();
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setStartPos(pos);

      setTempOverlay({
        top: pos.y,
        left: pos.x,
        width: 0,
        height: 0,
        tool: tool,
      });
    }
  }

  function handleMouseMove(e) {
    if (!drawing) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (startPos) {
      const top = Math.min(startPos.y, currentPos.y);
      const left = Math.min(startPos.x, currentPos.x);
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);
      setTempOverlay({ top, left, width, height, tool });
    }
  }

  function handleMouseUp(e) {
    if (!drawing) return;
    const rect = containerRef.current.getBoundingClientRect();
    const endPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (startPos && tempOverlay) {
      if (tool === "highlighter" || tool === "pen") {
        setOverlays(prev => [...prev, tempOverlay]);

      } else if (tool === "eraser") {
        const buffer = 5;
setOverlays(prev =>
  prev.filter(o => !(
    o.left + o.width + buffer > startPos.x &&
    o.left - buffer < endPos.x &&
    o.top + o.height + buffer > startPos.y &&
    o.top - buffer < endPos.y
  ))
);

      }
    }

    setTempOverlay(null);

    setDrawing(false);
    setStartPos(null);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/pdfs/${uuid}`);
        setPdfMeta(res.data.pdf || null);
        const res2 = await api.get(`/highlights/${uuid}`);
        setHighlights(res2.data.highlights || []);
      } catch (err) {
        console.error("Load error", err);
      }
    }
    load();
  }, [uuid]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages || 0);
  }

  const fileUrl = pdfMeta
    ? `${(import.meta.env.VITE_API_URL || "http://localhost:7000").replace(/\/api$/, "")}/files/${pdfMeta.storagePath}`
    : null;

  function computeOverlays() {
    if (!containerRef.current) return;
    const nodes = [];
    highlights.forEach((h) => {
      const pageEl = containerRef.current.querySelector(
        `[data-page-number="${h.page}"]`
      );
      if (!pageEl) return;
      const pageWidth = pageEl.clientWidth;
      const pageHeight = pageEl.clientHeight;
      const top = pageEl.offsetTop + h.rect.y * pageHeight;
      const left = pageEl.offsetLeft + h.rect.x * pageWidth;
      const width = h.rect.width * pageWidth;
      const height = h.rect.height * pageHeight;

      nodes.push({ ...h, top, left, width, height });
    });
    setOverlays(nodes);
  }

  useEffect(() => {
    const t = setTimeout(() => computeOverlays(), 200);
    return () => clearTimeout(t);
  }, [highlights, scale, numPages]);

  useEffect(() => {
    function handleMouseUp(e) {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectionMenu(null);
        return;
      }
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || rect.width === 0) return;
        setSelectionMenu({
          x: rect.left + rect.width / 2,
          y: rect.top - 40,
          text: sel.toString(),
          range,
        });
      } catch {
        setSelectionMenu(null);
      }
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  async function createHighlight() {
    if (!selectionMenu) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    const range = selectionMenu.range;
    const rect = range.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const pageEls = Array.from(
      containerRef.current.querySelectorAll("[data-page-number]")
    );
    let targetPage = null;
    for (const pe of pageEls) {
      const pr = pe.getBoundingClientRect();
      if (cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom) {
        targetPage = { el: pe, pr };
        break;
      }
    }
    if (!targetPage) return;

    const { el: pageEl, pr: pageRect } = targetPage;
    const pageWidth = pageEl.clientWidth;
    const pageHeight = pageEl.clientHeight;
    const normalized = {
      x: (rect.left - pageRect.left) / pageWidth,
      y: (rect.top - pageRect.top) / pageHeight,
      width: rect.width / pageWidth,
      height: rect.height / pageHeight,
    };

    try {
      const resp = await api.post("/highlights", {
        pdfUuid: uuid,
        page: parseInt(pageEl.getAttribute("data-page-number"), 10),
        text: selectionMenu.text,
        rect: normalized,
      });
      setHighlights((h) => [...h, resp.data.highlight]);
    } catch (err) {
      console.error("Highlight error", err);
    }

    sel.removeAllRanges();
    setSelectionMenu(null);
  }

  // .... added Save button handler ....
async function saveHighlights() {
  try {
    await Promise.all(
      highlights.map((h) =>
        api.post("/highlights", {
          pdfUuid: uuid,
          page: h.page,
          rect: h.rect,
          text: h.text || "",
          tool: h.tool || "highlighter",
        })
      )
    );
    alert("Highlights saved successfully!");
  } catch (err) {
    console.error("Save failed", err);
    alert("Failed to save highlights");
  }
}

  async function deleteHighlight(id) {
    try {
      await api.delete(`/highlights/${id}`);
      setHighlights((h) => h.filter((x) => x._id !== id));
    } catch (err) {
      console.error("Delete highlight failed", err);
    }
  }



  function goToHighlight(h) {
    const pageEl = containerRef.current.querySelector(
      `[data-page-number="${h.page}"]`
    );
    if (!pageEl) return;
    const targetY = pageEl.offsetTop + h.rect.y * pageEl.clientHeight - 60;
    containerRef.current.scrollTo({ top: targetY, behavior: "smooth" });
  }

  return (
    <div className="pdf-viewer-grid">
      <div className="toolbar">
        <div className="toolbar-left">
          <button style={{ backgroundColor: tool === "highlighter" ? "rgba(253, 2, 152, 1)" : "" }} onClick={() => setTool("highlighter")}>Highlighter</button>
          <button style={{ backgroundColor: tool === "pen" ? "rgba(253, 2, 152, 1)" : "" }} onClick={() => setTool("pen")}>Pen</button>
          <button style={{ backgroundColor: tool === "eraser" ? "rgba(253, 2, 152, 1)" : "" }} onClick={() => setTool("eraser")}>Eraser</button>
          <button onClick={() => setScale((s) => s + 0.1)}>Zoom +</button>
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>Zoom -</button>
        </div>

        <div className="toolbar-right">
          <button onClick={saveHighlights}>Save</button>
          <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </div>

      <div className="viewer-container" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        {tempOverlay && (
          <div
            className={`highlight-overlay ${tempOverlay.tool}`}
            style={{
              top: `${tempOverlay.top}px`,
              left: `${tempOverlay.left}px`,
              width: `${tempOverlay.width}px`,
              height: `${tempOverlay.height}px`,
              position: "absolute",
              pointerEvents: "none",
            }}
          />
        )}

        {fileUrl ? (
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from({ length: numPages }, (_, i) => (
              <div key={`page_${i + 1}`} className="page-wrapper">
                <Page
                  pageNumber={i + 1}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        ) : (
          <div className="no-file">No PDF loaded.</div>
        )}

        <div className="overlays">
          {overlays.map((o) => (
            <div
              key={o._id}
              className={`highlight-overlay ${o.tool || 'highlighter'}`}
              style={{ top: `${o.top}px`, left: `${o.left}px`, width: `${o.width}px`, height: `${o.height}px` }}
              title={o.text}
            />
          ))}
        </div>

         {selectionMenu && (
          <div
            className="selection-menu"
            style={{ left: selectionMenu.x, top: selectionMenu.y }}
          >
            <button onClick={createHighlight}>Highlight</button>
            <button onClick={() => setSelectionMenu(null)}>Cancel</button>
          </div>
        )} 
      </div>
    </div>
  );
}

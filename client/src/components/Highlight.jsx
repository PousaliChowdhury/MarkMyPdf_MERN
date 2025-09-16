import React from "react";

export default function HighlightOverlay({ highlights, pageRect }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {highlights.map((h) => {
        const style = {
          position: "absolute",
          left: `${h.rect.x * 100}%`,
          top: `${h.rect.y * 100}%`,
          width: `${h.rect.width * 100}%`,
          height: `${h.rect.height * 100}%`,
          background: "rgba(255,255,0,0.4)",
        };
        return <div key={h._id} style={style} title={h.text}></div>;
      })}
    </div>
  );
}

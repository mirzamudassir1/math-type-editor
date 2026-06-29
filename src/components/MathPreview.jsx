import { useEffect, useRef } from "react";
import "mathlive";

const MATH_OPEN = "§MATH§";
const MATH_CLOSE = "§END§";

export default function MathPreview({ value = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const regex = new RegExp(
      escapeRegex(MATH_OPEN) + "([\\s\\S]*?)" + escapeRegex(MATH_CLOSE),
      "g"
    );

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(value)) !== null) {
      if (match.index > lastIndex) {
        appendHtmlContent(el, value.slice(lastIndex, match.index));
      }
      el.appendChild(createPreviewMathField(match[1]));
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      appendHtmlContent(el, value.slice(lastIndex));
    }
  }, [value]);

  return (
    <span
      ref={containerRef}
      style={{ display: "inline", lineHeight: 1.7, verticalAlign: "middle" }}
    />
  );
}

function createPreviewMathField(latex) {
  const mf = document.createElement("math-field");
  mf.setAttribute("read-only", "");
  mf.setAttribute(
    "style",
    [
      "display:inline-block",
      "vertical-align:middle",
      "border:none",
      "background:transparent",
      "outline:none",
      "padding:0 2px",
      "margin:0 1px",
      "font-size:inherit",
      "min-height:auto",
      "--primary-color:#0f766e",
    ].join(";")
  );
  requestAnimationFrame(() => {
    if (mf.setValue) mf.setValue(latex);
    else mf.value = latex;
  });
  return mf;
}

function appendHtmlContent(parent, html) {
  if (!html) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const allowed = new Set([
    "B", "STRONG", "I", "EM", "U", "BR", "DIV", "P", "SPAN", "UL", "OL", "LI",
    "SUB", "SUP",
  ]);
  const copy = (src, dest) => {
    Array.from(src.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        dest.appendChild(document.createTextNode(node.textContent));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.nodeName;
        if (tag === "MATH-FIELD") {
          dest.appendChild(node.cloneNode(true));
        } else if (tag === "BR") {
          dest.appendChild(document.createElement("br"));
        } else if (allowed.has(tag)) {
          const map = { STRONG: "b", EM: "i" };
          const el = document.createElement(map[tag] || tag.toLowerCase());
          copy(node, el);
          dest.appendChild(el);
        } else {
          copy(node, dest);
        }
      }
    });
  };
  const clean = document.createElement("span");
  copy(tmp, clean);
  while (clean.firstChild) parent.appendChild(clean.firstChild);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

import { useEffect, useRef, useState } from "react";
import "./MathRibbon.css";

const getArrowFontSize = (value) => {
  const base = 16;
  const scale = 4;
  return base + (Number(value) || 0) * scale;
};

const TAB1_GROUPS = [
  { cols: 2, groupClass: "mr-cases-group", cellWidth: 40, cellGap: 1, items: [
    { label: "⬚_⬚", latex: "\\frac{#0}{#?}", icon: "fraction-template-image" },
    { label: "√⬚", latex: "\\sqrt{#0}", icon: "sqrt-template-image" },
    { label: "⬚⁄⬚", latex: "#0/#?", icon: "slash-fraction-template-image" },
    { label: "ⁿ√⬚", latex: "\\sqrt[#?\\;]{#0}", icon: "nth-root-template-image" },
  ]},
  { cols: 1, groupClass: "mr-cases-group", cellWidth: 40, cellGap: 1, items: [
    { label: "⬚ⁿ", latex: "#0^{#?}", icon: "superscript-template-image" },
    { label: "⬚ₙ", latex: "#0_{#?}", icon: "subscript-template-image" },
  ]},
  { cols: 2, groupClass: "mr-cases-group", cellWidth: 40, cellGap: 1, items: [
    { label: "(⬚)", latex: "\\left(#0\\right)", icon: "paren-delimiter-template-image" },
    { label: "|⬚|", latex: "\\left|#0\\right|", icon: "bar-delimiter-template-image" },
    { label: "[⬚]", latex: "\\left[#0\\right]", icon: "bracket-delimiter-template-image" },
    { label: "{⬚}", latex: "\\left\\{#0\\right\\}", icon: "brace-delimiter-template-image" },
  ]},
  { cols: 2, items: [
    { label: "+", latex: "+" }, { label: "∕", latex: "/" },
    { label: "×", latex: "\\times" }, { label: "±", latex: "\\pm" },
    { label: "−", latex: "-" }, { label: "÷", latex: "\\div" },
  ]},
  { cols: 2, items: [
    { label: "≥", latex: "\\geq" }, { label: "≤", latex: "\\leq" },
    { label: "∈", latex: "\\in" }, { label: "⊂", latex: "\\subset" },
    { label: "∪", latex: "\\cup" }, { label: "∩", latex: "\\cap" },
  ]},
  { cols: 1, items: [
    { label: "∅", latex: "\\emptyset" },
    { label: "∞", latex: "\\infty" },
    { label: "π", latex: "\\pi" },
  ]},
  { cols: 2, items: [
    { label: "⧉", command: "copy" }, { label: "↶", command: "undo" },
    { label: "✂", command: "cut" }, { label: "↷", command: "redo" },
    { label: "📋", command: "paste" },
  ]},
  { cols: 2, items: [
    { label: "B", latex: "\\mathbf{#0}" }, { label: "A", command: "color" },
    { label: "1b", latex: "\\mathit{#0}" }, { label: "Ω", action: "SPECIAL_CHARS" },
    { label: "1b", command: "noop" }, { label: "TI", latex: "\\text{#0}" },
  ]},
  { cols: 1, groupClass: "mr-funcs-roots-group", cellWidth: 34, cellGap: 1, items: [
    { label: "⌣√", command: "noop" },
    { label: "✎", command: "noop" },
  ]},
];

const TAB2_GROUPS = [
  { cols: 1, groupClass: "mr-diagonal-cross-single-group", cellWidth: 22, items: [
    { label: "⬚\n╱", latex: "\\enclose{updiagonalstrike}{#0}", icon: "updiagonalstrike-enclosure-template-image" },
  ] },
  { cols: 3, cellWidth: 23, cellGap: 0, items: [
    { label: "+", latex: "+" }, { label: "×", latex: "\\times" }, { label: "⋅", latex: "\\cdot" },
    { label: "−", latex: "-" }, { label: "÷", latex: "\\div" }, { label: "∕", latex: "/" },
    { label: "±", latex: "\\pm" }, { label: "∗", latex: "\\ast" }, { label: "∘", latex: "\\circ" },
  ], more: [
    { label: "\\", latex: "\\backslash" }, { label: "‵", latex: "\\backprime" }, { label: "∓", latex: "\\mp" },
  ]},
  { cols: 3, groupClass: "mr-funcs-scripts-group", cellWidth: 23, cellGap: 0, items: [
    { label: "π", latex: "\\pi" }, { label: "∂", latex: "\\partial" }, { label: "°", latex: "\\degree" },
    { label: "∞", latex: "\\infty" }, { label: "Δ", latex: "\\Delta" }, { label: "′", latex: "'" },
    { label: "∅", latex: "\\emptyset" }, { label: "∇", latex: "\\nabla" }, { label: "″", latex: "''" },
  ], more: [
    { label: "‷", latex: "‷" }, { label: "⁗", latex: "⁗" }, { label: "‛", latex: "‛" },
  ]},
  { cols: 2, cellWidth: 23, cellGap: 0, items: [
    { label: "=", latex: "=" }, { label: "≡", latex: "\\equiv" },
    { label: "∼", latex: "\\sim" }, { label: "≈", latex: "\\approx" },
    { label: "≃", latex: "\\simeq" }, { label: "≅", latex: "\\cong" },
  ], more: [
    { label: "≠", latex: "\\neq" }, { label: "≉", latex: "\\not\\approx" },
    { label: "≢", latex: "\\not\\equiv" }, null,
    { label: "≁", latex: "\\nsim" }, null,
  ], moreCols: 2 },
  { cols: 2, groupClass: "mr-funcs-element-scripts-group", cellWidth: 23, cellGap: 0, items: [
    { label: ">", latex: ">" }, { label: "<", latex: "<" },
    { label: "≥", latex: "\\geq" }, { label: "≤", latex: "\\leq" },
    { label: "≫", latex: "\\gg" }, { label: "≪", latex: "\\ll" },
  ], more: [
    { label: "≨", latex: "\\lneq" }, { label: "≫", latex: "\\gg" }, { label: "≻", latex: "\\succ" },
    { label: "≩", latex: "\\gneq" }, { label: "∝", latex: "\\propto" }, { label: "⊲", latex: "\\vartriangleleft" },
    { label: "≪", latex: "\\ll" }, { label: "≺", latex: "\\prec" }, { label: "▷", latex: "\\vartriangleright" },
  ], moreCols: 3 },
  { cols: 2, items: [
    { label: "∈", latex: "\\in" }, { label: "∋", latex: "\\ni" },
    { label: "∪", latex: "\\cup" }, { label: "∩", latex: "\\cap" },
    { label: "⊂", latex: "\\subset" }, { label: "⊃", latex: "\\supset" },
  ], more: [
    { label: "∉", latex: "\\notin" }, { label: "∌", latex: "\\not\\ni" }, { label: "⊆", latex: "\\subseteq" }, { label: "⊇", latex: "\\supseteq" },
    { label: "⊏", latex: "\\sqsubset" }, { label: "⊐", latex: "\\sqsupset" }, { label: "⊑", latex: "\\sqsubseteq" }, { label: "⊒", latex: "\\sqsupseteq" },
    { label: "⊓", latex: "\\sqcap" }, { label: "⊔", latex: "\\sqcup" },
  ], moreCols: 4 },
  { cols: 2, items: [
    { label: "∧", latex: "\\wedge" }, { label: "∨", latex: "\\vee" },
    { label: "¬", latex: "\\neg" }, { label: "∀", latex: "\\forall" },
    { label: "∃", latex: "\\exists" }, { label: "∄", latex: "\\nexists" },
  ], more: [
    { label: "⋰", latex: "⋰" }, { label: "⋱", latex: "\\ddots" },
  ], moreCols: 1 },
  { cols: 1, cellWidth: 23, cellGap: 0, items: [
    { label: "∠", latex: "\\angle" }, { label: "‖", latex: "\\parallel" }, { label: "⊥", latex: "\\perp" },
  ], more: [
    { label: "∦", latex: "\\nparallel" }, { label: "◊", latex: "\\diamond" },
    { label: "∡", latex: "\\measuredangle" }, null,
    { label: "∢", latex: "\\sphericalangle" }, null,
  ], moreCols: 2 },
  { cols: 1, groupClass: "mr-funcs-braces-group", cellWidth: 23, cellGap: 0, items: [
    { label: "□", latex: "\\square" }, { label: "△", latex: "\\triangle" }, { label: "○", latex: "\\bigcirc" },
  ], more: [] },
  { cols: 1, items: [
    { label: "⊕", latex: "\\oplus" }, { label: "⊗", latex: "\\otimes" }, { label: "⊙", latex: "\\odot" },
  ], more: [
    { label: "⊖", latex: "\\ominus" }, { label: "•", latex: "\\bullet" },
    { label: "⊛", latex: "\\circledast" }, null,
    { label: "⊝", latex: "\\circleddash" }, null,
  ], moreCols: 2 },
];

const TAB3_GROUPS = [
  { cols: 3, items: [
    { label: "←", latex: "\\leftarrow" }, { label: "→", latex: "\\rightarrow" }, { label: "↔", latex: "\\leftrightarrow" },
    { label: "⇐", latex: "\\Leftarrow" }, { label: "⇒", latex: "\\Rightarrow" }, { label: "⇔", latex: "\\Leftrightarrow" },
  ], more: [
    { label: "↗", latex: "\\nearrow" }, { label: "↘", latex: "\\searrow" }, { label: "↙", latex: "\\swarrow" }, { label: "↖", latex: "\\nwarrow" }, { label: "↩", latex: "\\hookleftarrow" }, { label: "↪", latex: "\\hookrightarrow" }, { label: "↼", latex: "\\leftharpoonup" }, { label: "⇀", latex: "\\rightharpoonup" }, { label: "↑", latex: "\\uparrow" },
    { label: "⇊", latex: "\\downdownarrows" }, { label: "⇇", latex: "\\leftleftarrows" }, { label: "⇉", latex: "\\rightrightarrows" }, { label: "⇄", latex: "\\rightleftarrows" }, { label: "⇌", latex: "\\rightleftharpoons" }, { label: "↽", latex: "\\leftharpoondown" }, { label: "⇁", latex: "\\rightharpoondown" }, { label: "⇆", latex: "\\leftrightarrows" }, { label: "↓", latex: "\\downarrow" },
    { label: "↿", latex: "\\upharpoonleft" }, { label: "⇃", latex: "\\downharpoonright" }, { label: "⇄", latex: "\\rightleftarrows" }, { label: "⇆", latex: "\\leftrightarrows" }, { label: "↕", latex: "\\updownarrow" }, { label: "⇕", latex: "\\Updownarrow" }, { label: "↵", latex: "\\hookleftarrow" }, null, null,
  ], moreCols: 9 },
  { cols: 2, groupClass: "mr-funcs-operators-group", cellWidth: 33, cellGap: 1, items: [
    { label: "⋮", latex: "\\vdots" }, { label: "⋰", latex: "⋰" },
    { label: "⋯", latex: "\\cdots" }, { label: "⋱", latex: "\\ddots" },
  ]},
  { cols: 1, items: [
    { label: "‾\n⬚", latex: "\\overline{#0}" },
    { label: "⬚\n_", latex: "\\underline{#0}" },
  ]},
  { cols: 3, items: [
    { label: "→\n⬚", latex: "\\xrightarrow[#?]{}", icon: "xrightarrow-top-template-image" }, { label: "⬚\n→", latex: "\\xrightarrow{#?}", icon: "xrightarrow-bottom-template-image" }, { label: "⬚\n→\n⬚", latex: "\\xrightarrow[#?]{#?}", icon: "xrightarrow-both-template-image" },
    { label: "←\n⬚", latex: "\\xleftarrow[#?]{}", icon: "xleftarrow-top-template-image" }, { label: "⬚\n←", latex: "\\xleftarrow{#?}", icon: "xleftarrow-bottom-template-image" }, { label: "⬚\n←\n⬚", latex: "\\xleftarrow[#?]{#?}", icon: "xleftarrow-both-template-image" },
  ], more: [
{ label: "↔̅", latex: "\\xleftrightarrow{#?}", icon: "leftrightarrow-over-template-image" },
{ label: "↔̲", latex: "\\xleftrightarrow[#?]{}", icon: "leftrightarrow-under-template-image" },
{ label: "↔̲̅", latex: "\\xleftrightarrow[#?]{#?}", icon: "leftrightarrow-over-under-template-image" },

{ label: "⇆̅", latex: "\\xtofrom{#?}", icon: "leftrightarrows-over-template-image" },
{ label: "⇆̲", latex: "\\xtofrom[#?]{}", icon: "leftrightarrows-under-template-image" },
{ label: "⇆̲̅", latex: "\\xtofrom[#?]{#?}", icon: "leftrightarrows-over-under-template-image" },

{ label: "⇄̅", latex: "\\xleftrightarrows{#?}", icon: "rightleftarrows-over-template-image" },
{ label: "⇄̲", latex: "\\xleftrightarrows[#?]{}", icon: "rightleftarrows-under-template-image" },
{ label: "⇄̲̅", latex: "\\xleftrightarrows[#?]{#?}", icon: "rightleftarrows-over-under-template-image" },

{ label: "⇋̅", latex: "\\xleftrightharpoons{#?}", icon: "leftrightharpoons-over-template-image" },
{ label: "⇋̲", latex: "\\xleftrightharpoons[#?]{}", icon: "leftrightharpoons-under-template-image" },
{ label: "⇋̲̅", latex: "\\xleftrightharpoons[#?]{#?}", icon: "leftrightharpoons-over-under-template-image" },

{ label: "⇌̅", latex: "\\xLeftrightharpoons{#?}", icon: "rightleftharpoons-over-template-image" },
{ label: "⇌̲", latex: "\\xLeftrightharpoons[#?]{}", icon: "rightleftharpoons-under-template-image" },
{ label: "⇌̲̅", latex: "\\xLeftrightharpoons[#?]{#?}", icon: "rightleftharpoons-over-under-template-image" },

{ label: "⥂̅", latex: "\\overset{#?}{\\underset{\\leftarrow}{\\rightarrow}}", icon: "right-over-short-left-over-template-image" },
{ label: "⥂̲", latex: "\\underset{#?}{\\underset{\\leftarrow}{\\rightarrow}}", icon: "right-over-short-left-under-template-image" }, 
{ label: "⥂̲̅", latex: "\\overset{#?}{\\underset{#?}{\\underset{\\leftarrow}{\\rightarrow}}}", icon: "right-over-short-left-over-under-template-image" },

{ label: "⥃̅", latex: "\\overset{#?}{\\overset{\\rightarrow}{\\leftarrow}}", icon: "short-right-over-left-over-template-image" }, 
{ label: "⥃̲", latex: "\\underset{#?}{\\overset{\\rightarrow}{\\leftarrow}}", icon: "short-right-over-left-under-template-image" },
{ label: "⥃̲̅", latex: "\\overset{#?}{\\underset{#?}{\\overset{\\rightarrow}{\\leftarrow}}}", icon: "short-right-over-left-over-under-template-image" }, 

  ], moreCols: 11, dropdownClass: "mr-dropdown-script-arrows", moreCellWidth: 32, moreCellGap: 2 },
  { cols: 2, groupClass: "mr-tab3-accent-group", cellWidth: 32, cellGap: 2, items: [
    { label: "→\n⬚", latex: "\\xrightarrow[#?]{}", icon: "xrightarrow-under-custom-template-image" }, 
    { label: "↔\n⬚", latex: "\\xleftrightarrow[#?]{}", icon: "xleftrightarrow-under-custom-template-image" },
    { label: "⇀\n⬚", latex: "\\overrightharpoon{#0}", icon: "overrightharpoon-custom-template-image" }, 
    { label: "‾\n⬚", latex: "\\overline{#0}", icon: "overline-custom-template-image" },
  ]},
];

const TAB4_GROUPS = [
  { cols: 10, items: [
    { label: "α", latex: "\\alpha" }, { label: "β", latex: "\\beta" }, { label: "γ", latex: "\\gamma" }, { label: "δ", latex: "\\delta" }, { label: "ε", latex: "\\epsilon" }, { label: "ζ", latex: "\\zeta" }, { label: "η", latex: "\\eta" }, { label: "θ", latex: "\\theta" }, { label: "ϑ", latex: "\\vartheta" }, { label: "ι", latex: "\\iota" },
    { label: "κ", latex: "\\kappa" }, { label: "λ", latex: "\\lambda" }, { label: "μ", latex: "\\mu" }, { label: "ν", latex: "\\nu" }, { label: "ξ", latex: "\\xi" }, { label: "ο", latex: "o" }, { label: "π", latex: "\\pi" }, { label: "ϖ", latex: "\\varpi" }, { label: "ρ", latex: "\\rho" }, { label: "ς", latex: "\\varsigma" },
    { label: "σ", latex: "\\sigma" }, { label: "τ", latex: "\\tau" }, { label: "υ", latex: "\\upsilon" }, { label: "φ", latex: "\\varphi" }, { label: "ϕ", latex: "\\phi" }, { label: "χ", latex: "\\chi" }, { label: "ψ", latex: "\\psi" }, { label: "ω", latex: "\\omega" },
  ]},
  { cols: 2, groupClass: "mr-funcs-operators-group", cellWidth: 33, cellGap: 1, items: [
    { label: "ℕ", latex: "\\mathbb{N}" }, { label: "ℤ", latex: "\\mathbb{Z}" },
    { label: "ℚ", latex: "\\mathbb{Q}" }, { label: "ℂ", latex: "\\mathbb{C}" },
    { label: "ℝ", latex: "\\mathbb{R}" }, { label: "ℙ", latex: "\\mathbb{P}" },
  ], more: [
    { label: "𝔸", latex: "\\mathbb{A}" }, { label: "𝔻", latex: "\\mathbb{D}" }, { label: "𝔾", latex: "\\mathbb{G}" }, { label: "𝕁", latex: "\\mathbb{J}" }, { label: "𝕄", latex: "\\mathbb{M}" }, { label: "ℙ", latex: "\\mathbb{P}" }, { label: "𝕊", latex: "\\mathbb{S}" }, { label: "𝕍", latex: "\\mathbb{V}" }, { label: "𝕐", latex: "\\mathbb{Y}" }, { label: "𝕒", latex: "\\mathbb{a}" }, { label: "𝕕", latex: "\\mathbb{d}" },
    { label: "𝕘", latex: "\\mathbb{g}" }, { label: "𝕛", latex: "\\mathbb{j}" }, { label: "𝕞", latex: "\\mathbb{m}" }, { label: "𝕡", latex: "\\mathbb{p}" }, { label: "𝕤", latex: "\\mathbb{s}" }, { label: "𝕧", latex: "\\mathbb{v}" }, { label: "𝕪", latex: "\\mathbb{y}" }, { label: "𝔹", latex: "\\mathbb{B}" }, { label: "𝔼", latex: "\\mathbb{E}" }, { label: "ℍ", latex: "\\mathbb{H}" }, { label: "𝕂", latex: "\\mathbb{K}" },
    { label: "ℕ", latex: "\\mathbb{N}" }, { label: "ℚ", latex: "\\mathbb{Q}" }, { label: "𝕋", latex: "\\mathbb{T}" }, { label: "𝕎", latex: "\\mathbb{W}" }, { label: "ℤ", latex: "\\mathbb{Z}" }, { label: "𝕓", latex: "\\mathbb{b}" }, { label: "𝕖", latex: "\\mathbb{e}" }, { label: "𝕙", latex: "\\mathbb{h}" }, { label: "𝕜", latex: "\\mathbb{k}" }, { label: "𝕟", latex: "\\mathbb{n}" }, { label: "𝕢", latex: "\\mathbb{q}" }, 
    { label: "𝕥", latex: "\\mathbb{t}" }, { label: "𝕨", latex: "\\mathbb{w}" }, { label: "𝕫", latex: "\\mathbb{z}" }, { label: "ℂ", latex: "\\mathbb{C}" }, { label: "𝔽", latex: "\\mathbb{F}" }, { label: "𝕀", latex: "\\mathbb{I}" }, { label: "𝕃", latex: "\\mathbb{L}" }, { label: "𝕆", latex: "\\mathbb{O}" }, { label: "ℝ", latex: "\\mathbb{R}" }, { label: "𝕌", latex: "\\mathbb{U}" }, { label: "𝕏", latex: "\\mathbb{X}" }, 
    { label: "𝕔", latex: "\\mathbb{c}" }, { label: "𝕗", latex: "\\mathbb{f}" }, { label: "𝕚", latex: "\\mathbb{i}" }, { label: "𝕝", latex: "\\mathbb{l}" }, { label: "𝕠", latex: "\\mathbb{o}" }, { label: "𝕣", latex: "\\mathbb{r}" }, { label: "𝕦", latex: "\\mathbb{u}" }, { label: "𝕩", latex: "\\mathbb{x}" },
  ], moreCols: 18 },
  { cols: 1, items: [
    { label: "𝔄", latex: "\\mathfrak{A}" }, { label: "𝔅", latex: "\\mathfrak{B}" }, { label: "ℭ", latex: "\\mathfrak{C}" },
  ], more: [
    { label: "𝔄", latex: "\\mathfrak{A}" }, { label: "𝔇", latex: "\\mathfrak{D}" }, { label: "𝔊", latex: "\\mathfrak{G}" }, { label: "𝔍", latex: "\\mathfrak{J}" }, { label: "𝔐", latex: "\\mathfrak{M}" }, { label: "𝔓", latex: "\\mathfrak{P}" }, { label: "𝔖", latex: "\\mathfrak{S}" }, { label: "𝔙", latex: "\\mathfrak{V}" }, { label: "𝔜", latex: "\\mathfrak{Y}" }, { label: "𝔞", latex: "\\mathfrak{a}" }, 
    { label: "𝔡", latex: "\\mathfrak{d}" }, { label: "𝔤", latex: "\\mathfrak{g}" }, { label: "𝔧", latex: "\\mathfrak{j}" }, { label: "𝔪", latex: "\\mathfrak{m}" }, { label: "𝔭", latex: "\\mathfrak{p}" }, { label: "𝔰", latex: "\\mathfrak{s}" }, { label: "𝔳", latex: "\\mathfrak{v}" }, { label: "𝔶", latex: "\\mathfrak{y}" }, { label: "𝔅", latex: "\\mathfrak{B}" }, { label: "𝔈", latex: "\\mathfrak{E}" }, { label: "ℌ", latex: "\\mathfrak{H}" }, 
    { label: "𝔎", latex: "\\mathfrak{K}" }, { label: "𝔑", latex: "\\mathfrak{N}" }, { label: "𝔔", latex: "\\mathfrak{Q}" }, { label: "𝔗", latex: "\\mathfrak{T}" }, { label: "𝔚", latex: "\\mathfrak{W}" }, { label: "ℨ", latex: "\\mathfrak{Z}" }, { label: "𝔟", latex: "\\mathfrak{b}" }, { label: "𝔢", latex: "\\mathfrak{e}" }, { label: "𝔥", latex: "\\mathfrak{h}" }, { label: "𝔨", latex: "\\mathfrak{k}" }, { label: "𝔫", latex: "\\mathfrak{n}" }, 
    { label: "𝔮", latex: "\\mathfrak{q}" }, { label: "𝔱", latex: "\\mathfrak{t}" }, { label: "𝔴", latex: "\\mathfrak{w}" }, { label: "𝔷", latex: "\\mathfrak{z}" }, { label: "ℭ", latex: "\\mathfrak{C}" }, { label: "𝔉", latex: "\\mathfrak{F}" }, { label: "ℑ", latex: "\\mathfrak{I}" }, { label: "𝔏", latex: "\\mathfrak{L}" }, { label: "𝔒", latex: "\\mathfrak{O}" }, { label: "ℜ", latex: "\\mathfrak{R}" }, { label: "𝔘", latex: "\\mathfrak{U}" }, 
    { label: "𝔛", latex: "\\mathfrak{X}" }, { label: "𝔠", latex: "\\mathfrak{c}" }, { label: "𝔣", latex: "\\mathfrak{f}" }, { label: "𝔦", latex: "\\mathfrak{i}" }, { label: "𝔩", latex: "\\mathfrak{l}" }, { label: "𝔬", latex: "\\mathfrak{o}" }, { label: "𝔯", latex: "\\mathfrak{r}" }, { label: "𝔲", latex: "\\mathfrak{u}" }, { label: "𝔵", latex: "\\mathfrak{x}" },
  ], moreCols: 18 },
  { cols: 2, groupClass: "mr-funcs-spacing-group", cellWidth: 30, cellGap: 1, items: [
    { label: "𝒜", latex: "\\mathscr{A}" }, { label: "𝒥", latex: "\\mathscr{J}" },
    { label: "ℬ", latex: "\\mathscr{B}" }, { label: "ℛ", latex: "\\mathscr{R}" },
    { label: "𝒞", latex: "\\mathscr{C}" }, { label: "ℓ", latex: "\\mathscr{l}" },
  ], more: [
    { label: "𝒜", latex: "\\mathscr{A}" }, { label: "𝒟", latex: "\\mathscr{D}" }, { label: "𝒢", latex: "\\mathscr{G}" }, { label: "𝒥", latex: "\\mathscr{J}" }, { label: "ℳ", latex: "\\mathscr{M}" }, { label: "𝒫", latex: "\\mathscr{P}" }, { label: "𝒮", latex: "\\mathscr{S}" }, { label: "𝒱", latex: "\\mathscr{V}" }, { label: "𝒴", latex: "\\mathscr{Y}" }, { label: "𝒶", latex: "\\mathscr{a}" }, { label: "𝒹", latex: "\\mathscr{d}" }, 
    { label: "ℊ", latex: "\\mathscr{g}" }, { label: "𝒿", latex: "\\mathscr{j}" }, { label: "𝓂", latex: "\\mathscr{m}" }, { label: "𝓅", latex: "\\mathscr{p}" }, { label: "𝓈", latex: "\\mathscr{s}" }, { label: "𝓋", latex: "\\mathscr{v}" }, { label: "𝓎", latex: "\\mathscr{y}" }, { label: "ℬ", latex: "\\mathscr{B}" }, { label: "ℰ", latex: "\\mathscr{E}" }, { label: "ℋ", latex: "\\mathscr{H}" }, { label: "𝒦", latex: "\\mathscr{K}" }, 
    { label: "𝒩", latex: "\\mathscr{N}" }, { label: "𝒬", latex: "\\mathscr{Q}" }, { label: "𝒯", latex: "\\mathscr{T}" }, { label: "𝒲", latex: "\\mathscr{W}" }, { label: "𝒵", latex: "\\mathscr{Z}" }, { label: "𝒷", latex: "\\mathscr{b}" }, { label: "ℯ", latex: "\\mathscr{e}" }, { label: "𝒽", latex: "\\mathscr{h}" }, { label: "𝓀", latex: "\\mathscr{k}" }, { label: "𝓃", latex: "\\mathscr{n}" }, { label: "𝓆", latex: "\\mathscr{q}" }, 
    { label: "𝓉", latex: "\\mathscr{t}" }, { label: "𝓌", latex: "\\mathscr{w}" }, { label: "𝓏", latex: "\\mathscr{z}" }, { label: "𝒞", latex: "\\mathscr{C}" }, { label: "ℱ", latex: "\\mathscr{F}" }, { label: "ℐ", latex: "\\mathscr{I}" }, { label: "ℒ", latex: "\\mathscr{L}" }, { label: "𝒪", latex: "\\mathscr{O}" }, { label: "ℛ", latex: "\\mathscr{R}" }, { label: "𝒰", latex: "\\mathscr{U}" }, { label: "𝒳", latex: "\\mathscr{X}" }, { label: "𝒸", latex: "\\mathscr{c}" }, { label: "𝒻", latex: "\\mathscr{f}" }, { label: "𝒾", latex: "\\mathscr{i}" }, { label: "𝓁", latex: "\\mathscr{l}" }, { label: "ℴ", latex: "\\mathscr{o}" }, { label: "𝓇", latex: "\\mathscr{r}" }, { label: "𝓊", latex: "\\mathscr{u}" }, { label: "𝓍", latex: "\\mathscr{x}" },
  ], moreCols: 18 },
  { cols: 1, items: [
    { label: "ℵ", latex: "\\aleph" }, { label: "℘", latex: "\\wp" },
  ], more: [
    { label: "ℵ", latex: "\\aleph" }, { label: "ℒ", latex: "\\mathscr{L}" },
    { label: "℘", latex: "\\wp" }, { label: "ℨ", latex: "\\mathfrak{Z}" },
    { label: "ℱ", latex: "\\mathscr{F}" },
  ], moreCols: 2 },
  { cols: 2, items: [
    { label: "H", latex: "\\text{H}" }, { label: "C", latex: "\\text{C}" },
    { label: "N", latex: "\\text{N}" }, { label: "O", latex: "\\text{O}" },
    { label: "F", latex: "\\text{F}" }, { label: "S", latex: "\\text{S}" },
  ], type: "periodic-table" },
];

const TAB5_GROUPS = [
  { type: "inline-matrix-picker" },
  { cols: 3, groupClass: "mr-tab5-matrix-group", cellWidth: 34, cellGap: 1, items: [
    { label: "□\n□\n□", latex: "\\begin{matrix} #? \\\\ #? \\\\ #? \\end{matrix}", icon: "matrix-vertical-plain-template-image" },
    { label: "[□\n□]", latex: "\\left[\\vphantom{\\begin{array}{c}X\\\\[2pt]X\\end{array}}\\begin{matrix} #? \\\\[-1pt] #? \\end{matrix}\\right]", icon: "matrix-vertical-square-template-image" },
    { label: "(□\n□)", latex: "\\left(\\vphantom{\\begin{array}{c}X\\\\[2pt]X\\end{array}}\\begin{matrix} #? \\\\[-1pt] #? \\end{matrix}\\right)", icon: "matrix-vertical-round-template-image" },
    { label: "□ □ □", latex: "\\begin{matrix} #? \\, #? \\, #? \\end{matrix}", icon: "matrix-horizontal-plain-template-image" },
    { label: "[□ & □]", latex: "\\left[\\begin{matrix} #? \\, #? \\end{matrix}\\right]", icon: "matrix-horizontal-square-template-image" },
    { label: "(□ & □)", latex: "\\left(\\begin{matrix} #? \\, #? \\end{matrix}\\right)", icon: "matrix-horizontal-round-template-image" },
  ]},
  { cols: 2, groupClass: "mr-tab5-cases-group", cellWidth: 34, cellGap: 1, items: [
    { label: "{", latex: "\\left\\{\\begin{matrix} \\rule[-0.35em]{0pt}{1.9em}#? \\\\[4pt] \\rule[-0.35em]{0pt}{1.9em}#? \\end{matrix}\\right.", icon: "cases-left-template-image" },
    { label: "f(x)", latex: "\\left\\{\\begin{matrix} \\rule[-0.35em]{0pt}{1.9em}#?, \\, #? \\\\[4pt] \\rule[-0.35em]{0pt}{1.9em}#?, \\, #? \\end{matrix}\\right.", icon: "cases-piecewise-template-image" },
    { label: "}", latex: "\\left.\\vphantom{\\begin{array}{c}X\\\\[2pt]X\\end{array}}\\begin{matrix} #? \\\\ #? \\end{matrix}\\right\\}", icon: "cases-right-template-image" },
    { label: "=", latex: "\\begin{aligned} #? &= #? \\\\ #? &= #? \\end{aligned}", icon: "aligned-equations-template-image" },
  ]},
  { cols: 2, groupClass: "mr-tab5-dots-group", cellWidth: 32, cellGap: 1, items: [
    { label: "⋮", latex: "\\vdots" },
    { label: "⋰", latex: "⋰" },
    { label: "…", latex: "\\ldots" },
    { label: "⋱", latex: "\\ddots" },
  ]},
  { cols: 1, groupClass: "mr-tab5-array-group", cellWidth: 34, cellGap: 1, items: [
    { label: "+", latex: "\\frac{\\begin{array}{r}#?\\\\+\\,#?\\end{array}}{\\quad#?}", icon: "addition-array-template-image" },
    { label: "⟌", latex: "#?\\, ) \\!\\! \\overset{\\displaystyle #?}{\\overline{\\vphantom{1}\\;\\;#?\\;}}", icon: "long-division-template-image" },
  ], more: [
    { label: " ", latex: "\\frac{\\begin{array}{r}#?\\\\ \\,#?\\end{array}}{\\;#?}", icon: "blank-array-template-image" },
    { label: "-", latex: "\\frac{\\begin{array}{r}#?\\\\-\\,#?\\end{array}}{\\quad#?}", icon: "subtraction-array-template-image" },
    { label: "*", latex: "\\frac{\\begin{array}{r}#?\\\\*\\,#?\\end{array}}{\\quad#?}", icon: "multiplication-array-template-image" },
    { label: "÷", latex: "\\begin{array}{r@{}l} #?\\, & \\begin{array}{|@{}l} \\underline{\\;#?\\;\\,} \\end{array} \\\\ & \\; #? \\end{array}", icon: "division-array-template-image" },
    { label: "÷", latex: "\\begin{array}{r@{}l} #?\\, & \\begin{array}{|@{}l} \\underline{\\;#?\\;\\,} \\end{array} \\\\ #?\\, & \\; #? \\end{array}", icon: "division-four-box-template-image" },
    { label: "⟌", latex: "#?\\, ) \\!\\!\\!\\!\\! \\begin{array}\\overset{\\displaystyle #?}{\\overline{\\vphantom{1}\\;\\;#?\\;}} \\\\ \\;\\;#?\\; \\end{array}", icon: "long-division-stacked-template-image" },
  ], moreCols: 3 },
];
// eslint-disable-next-line no-unused-vars
const TAB6_GROUPS = [
  // Section 1 â€” Fractions
  { cols: 2, groupClass: "mr-funcs-fractions-group", cellWidth: 34, cellGap: 1, items: [
    { label: "⬚_⬚", latex: "\\frac{#0}{#?}", icon: "fraction-template-image" },                      // big fraction
    { label: "⬚_⬚", latex: "\\frac{#0}{#?}", icon: "fraction-template-image" },                      // small fraction
{ label: "â¬šâ•±â¬š", latex: "{}^{#0}\\mkern-2mu/\\mkern-2mu_{#?}", icon: "bevelled-fraction-template-image" },
{ label: "â¬šâ•±â¬š", latex: "\\scriptstyle{{}^{#0}\\mkern-2mu/\\mkern-2mu_{#?}}", icon: "bevelled-fraction-template-image" },            // bevelled small fraction
  ]},

  // Section 2 â€” Roots
  { cols: 1, groupClass: "mr-funcs-roots-group", cellWidth: 34, cellGap: 1, items: [
    { label: "√⬚", latex: "\\sqrt{#0}", icon: "sqrt-template-image" },                                // square root
    { label: "ⁿ√⬚", latex: "\\sqrt[#?\\;]{#0}", icon: "nth-root-template-image" },                           // root (nth root)
  ]},

  // Section 3 â€” Scripts
  { cols: 3, groupClass: "mr-funcs-scripts-group", cellWidth: 32, cellGap: 1, items: [
    { label: "⬚ⁿ", latex: "#0^{#?}", icon: "superscript-template-image" },                                   // superscript
    { label: "â¬šâ¿\nâ¬šâ‚™", latex: "#0_{#?}^{#?}", icon: "right-sup-sub-template-image" },                          // superscript and subscript
    { label: "⬚ₙ", latex: "#0_{#?}", icon: "subscript-template-image" },                                   // subscript
    { label: "â¿â¬š", latex: "{}^{#?}#0", icon: "left-sup-template-image" },                                 // left superscript
    { label: "â¿â¬š\nâ‚™", latex: "{}_{#?}^{#?}#0", icon: "left-sup-sub-template-image" },                         // left superscript and subscript
    { label: "â‚™â¬š", latex: "{}_{#?}#0", icon: "left-sub-template-image" },                                 // left subscript
  ]},

  // Section 4 â€” Element scripts
  { cols: 2, groupClass: "mr-funcs-element-scripts-group", cellWidth: 32, cellGap: 1, items: [
    { label: "â¬š\nâ¬š", latex: "\\overset{#?}{#0}", icon: "overset-template-image" },                       // element over
    { label: "â¬š\nâ¬š", latex: "\\underset{#?}{#0}", icon: "underset-template-image" },                      // element under
    { label: "â¬š\nâ¬š\nâ¬š", latex: "\\overset{#?}{\\underset{#?}{#0}}", icon: "over-under-template-image" },    // element under and over
  ]},

  // Section 5 â€” Underscript/Overscript with braces
  { cols: 1, groupClass: "mr-funcs-braces-group", cellWidth: 34, cellGap: 1, items: [
    { label: "âŸ\nâ¬š", latex: "\\underbrace{#0}_{#?}", icon: "underbrace-template-image" },                   // underscript with braces
    { label: "â¬š\nâž", latex: "\\overbrace{#0}^{#?}", icon: "overbrace-template-image" },                    // overscript with braces
  ]},

  //  Big operators with scripts (generic operator placeholder)
  { cols: 2, groupClass: "mr-funcs-operators-group", cellWidth: 33, cellGap: 1, items: [
    { label: "â¬š\nâ€\nâ¬š", latex: "\\overset{#?}{\\underset{#?}{#?}}", icon: "operator-limits-both-template-image" },
    { label: "â¬šâŒ", latex: "#?_{#?}^{#?}", icon: "operator-right-sup-sub-template-image" },
    { label: "â¬š\nâ€", latex: "\\underset{#?}{#?}", icon: "operator-lower-limit-template-image" },
    { label: "â¬šâŒâ‚™", latex: "#?_{#?}", icon: "operator-right-sub-template-image" },
  ]},

  { cols: 2, groupClass: "mr-funcs-spacing-group", cellWidth: 30, cellGap: 1, items: [
    { label: "â¬š â¬š", latex: "\\;", icon: "digit-space-template-image" },                                      // digit space
    { label: "â¬šâ¬š", latex: "\\,", icon: "thin-space-template-image" },                                       // thinner space
    { label: "â¬šâ¬š", latex: "\\!", icon: "negative-thin-space-template-image" },                                       // back space (negative thin space)
  ]},
];

 const TAB7_GROUPS = [
  // Group 1 â€” bracket/delimiter pairs (3 cols Ã— 2 rows)
  { cols: 3, items: [
  { label: "(â¬š)", latex: "\\left(#0\\right)", icon: "paren-delimiter-template-image" },
  { label: "|â¬š|", latex: "\\left|#0\\right|", icon: "bar-delimiter-template-image" },
  { label: "âŸ¨â¬šâŸ©", latex: "\\left\\langle#0\\right\\rangle", icon: "angle-delimiter-template-image" },
  { label: "[â¬š]", latex: "\\left[#0\\right]", icon: "bracket-delimiter-template-image" },
  { label: "â€–â¬šâ€–", latex: "\\left\\|#0\\right\\|", icon: "double-bar-delimiter-template-image" },
  { label: "{â¬š}", latex: "\\left\\{#0\\right\\}", icon: "brace-delimiter-template-image" },
], more: [
  { label: "âŒŠâ¬šâŒ‹", latex: "\\left\\lfloor#0\\right\\rfloor", icon: "floor-delimiter-template-image" },
  { label: "âŸ¨â¬š|â¬šâŸ©", latex: "\\left\\langle#0\\middle|#?\\right\\rangle", icon: "bra-ket-delimiter-template-image" },
  { label: "âŒˆâ¬šâŒ‰", latex: "\\left\\lceil#0\\right\\rceil", icon: "ceiling-delimiter-template-image" },
], moreCols: 3 },
  // Group 2 â€” over/under brace and paren accents (2 cols Ã— 2 rows)
  { cols: 2, items: [
    { label: "âž\nâ¬š", latex: "\\overbrace{#0}", icon: "overbrace-plain-template-image" },
    { label: "âœ\nâ¬š", latex: "\\overparen{#0}", icon: "overparen-template-image" },
    { label: "â¬š\nâŸ", latex: "\\underbrace{#0}", icon: "underbrace-plain-template-image" },
    { label: "â¬š\nâ", latex: "\\underparen{#0}", icon: "underparen-template-image" },
  ]},
  // Group 3 â€” accent marks over a box (3 cols Ã— 3 rows, last cell empty)
{ cols: 3, items: [
  { label: "â‡€\nâ¬š", latex: "\\overrightharpoon{#0}", icon: "vec-accent-template-image" },
  { label: "âŸ¶\nâ¬š", latex: "\\overrightarrow{#0}", icon: "overrightarrow-accent-template-image" },
  { label: "â†”\nâ¬š", latex: "\\overleftrightarrow{#0}", icon: "overleftrightarrow-accent-template-image" },
  { label: "Ë‰\nâ¬š", latex: "\\overline{#0}", icon: "bar-accent-template-image" },
  { label: "Ë†\nâ¬š", latex: "\\overset{\\wedge}{\\overline{#0}}", icon: "hat-accent-template-image" },
  { label: "Ëœ\nâ¬š", latex: "\\tilde{#0}", icon: "tilde-accent-template-image" },
  { label: "Â¨\nâ¬š", latex: "\\ddot{#0}", icon: "ddot-accent-template-image" },
  { label: "Ë™\nâ¬š", latex: "\\dot{#0}", icon: "dot-accent-template-image" },
]},
// Group 4 â€” overline/underline/boxed/circled enclosures (3 cols Ã— 2 rows)
  { cols: 3, items: [
    { label: "â€¾\nâ¬š", latex: "\\overline{#0}", icon: "overline-enclosure-template-image" },
    { label: "|â¬š", latex: "|#0", icon: "left-bar-enclosure-template-image" },
    { label: "â–­\nâ¬š", latex: "\\boxed{#0}", icon: "boxed-enclosure-template-image" },
    { label: "â¬š\n_", latex: "\\underline{#0}", icon: "underline-enclosure-template-image" },
    { label: "â¬š|", latex: "#0|", icon: "right-bar-enclosure-template-image" },
    { label: "â“„", latex: "\\enclose{circle}{#0}", icon: "circle-enclosure-template-image" },
  ], more: [
    { label: "âŒâ¬š", latex: "\\enclose{actuarial}{#0}", icon: "actuarial-enclosure-template-image" },
    { label: "â–¢\nâ¬š", latex: "\\enclose{roundedbox}{#0}", icon: "roundedbox-enclosure-template-image" },
  ], moreCols: 2 },
  // Group 5 â€” strike-through enclosures (2 cols Ã— 2 rows)
{ cols: 2, items: [
  { label: "â¬š\nâ•±", latex: "\\enclose{updiagonalstrike}{#0}", icon: "updiagonalstrike-enclosure-template-image" },
{ label: "â¬š\nâ€”", latex: "\\enclose{horizontalstrike}{\\begin{array}{c@{}} \\raisebox{-8px}{#?} \\end{array}}", icon: "crossstrike-enclosure-template-image" },
  { label: "â¬š\nâ•²", latex: "\\enclose{downdiagonalstrike}{#0}", icon: "downdiagonalstrike-enclosure-template-image" },
  { label: "â¬š\nâ•³", latex: "\\enclose{updiagonalstrike downdiagonalstrike}{#0}", icon: "diagonal-cross-enclosure-template-image" },
], more: [
  { label: "â¬š\nâ”‚", latex: "\\enclose{verticalstrike}{#0}", icon: "verticalstrike-enclosure-template-image" },
  { label: "âˆšâ¬š", latex: "\Root", icon: "curved-root-enclosure-template-image" },
  { label: "âŠ•\nâ¬š", latex: "\\enclose{horizontalstrike}{\\begin{array}{c@{}} \\raisebox{-8px}{\\enclose{verticalstrike}{\\vphantom{\\rule{0pt}{14px}}#?}} \\end{array}}", icon: "horizontal-vertical-strike-enclosure-template-image" },
], moreCols: 3 },
];
const TAB8_GROUPS = [
  // Section 1: Sigma (Sum)
  { cols: 2, items: [
    { label: "⬚\nΣ\n⬚", latex: "\\sum\\limits_{#0}^{#?}", icon: "sum-limits-both-template-image" },   // over and under script
    { label: "Σ⬚\n ⬚", latex: "\\sum\\nolimits_{#0}^{#?}", icon: "sum-right-sup-sub-template-image" },  // subscript and superscript
    { label: "Σ\n⬚", latex: "\\sum\\limits_{#0}", icon: "sum-limits-under-template-image" },           // under script only
    { label: "Σ⬚", latex: "\\sum\\nolimits_{#0}", icon: "sum-right-sub-template-image" },           // subscript only
  ]},
  // Section 2: Pi (Product)
  { cols: 2, items: [
    { label: "⬚\nΠ\n⬚", latex: "\\prod\\limits_{#0}^{#?}", icon: "prod-limits-both-template-image" },   // over and under script
    { label: "Π⬚\n ⬚", latex: "\\prod\\nolimits_{#0}^{#?}", icon: "prod-right-sup-sub-template-image" },  // subscript and superscript
    { label: "Π\n⬚", latex: "\\prod\\limits_{#0}", icon: "prod-limits-under-template-image" },           // under script only
    { label: "Π⬚", latex: "\\prod\\nolimits_{#0}", icon: "prod-right-sub-template-image" },           // subscript only
  ]},
  // Section 3: generic big operator (editable symbol + scripts)
  { cols: 2, items: [
    { label: "⬚\n⬚\n⬚", latex: "\\mathop{#0}\\limits_{#?}^{#?}", icon: "mathop-limits-both-template-image" },   // over and under script
    { label: "⬚⬚\n ⬚", latex: "\\mathop{#0}\\nolimits_{#?}^{#?}", icon: "mathop-right-sup-sub-template-image" },  // subscript and superscript
    { label: "⬚\n⬚", latex: "\\mathop{#0}\\limits_{#?}", icon: "mathop-limits-under-template-image" },           // under script only
    { label: "⬚⬚", latex: "\\mathop{#0}\\nolimits_{#?}", icon: "mathop-right-sub-template-image" },           // subscript only
  ]},
  // Section 4: set/big operators - plain symbols
  { cols: 1, items: [
    { label: "∩", latex: "\\cap" },
    { label: "∪", latex: "\\cup" },
  ], more: [
    { label: "⊓", latex: "\\sqcap" },
    { label: "Π", latex: "\\prod" },
    { label: "Σ", latex: "\\sum" },
    { label: "⊔", latex: "\\sqcup" },
    { label: "∐", latex: "\\coprod" },
  ], moreCols: 3 },
];
const TAB9_GROUPS = [
  // Section 1: Integral basics
  { cols: 2, items: [
    { label: "∫⬚\n⬚", latex: "\\int_{#0}^{#?}", icon: "integral-bounds-template-image" },
    { label: "∫⬚\n⬚⬚d⬚", latex: "\\int_{#0}^{#?}#?\\,d#?", icon: "integral-bounds-differential-template-image" },
    { label: "∫\n⬚", latex: "\\int_{#0}", icon: "integral-lower-bound-template-image" },
    { label: "∫\n⬚⬚d⬚", latex: "\\int_{#0}#?\\,d#?", icon: "integral-lower-bound-differential-template-image" },
  ]},

  // Section 2: Derivatives
  { cols: 2, items: [
    { label: "d", latex: "d" },
    { label: "d⬚\nd⬚", latex: "\\frac{d#0}{d#?}" },
    { label: "∂", latex: "\\partial" },
    { label: "∂⬚\n∂⬚", latex: "\\frac{\\partial#0}{\\partial#?}" },
  ]},

  // Section 3: Limits
  { cols: 1, items: [
    { label: "lim\n⬚→∞", latex: "\\lim_{#0 \\to \\infty}" },
    { label: "lim\n⬚", latex: "\\lim_{#0}" },
  ]},

  // Section 4: Vector calculus
  { cols: 2, items: [
    { label: "∇×⬚", latex: "\\nabla \\times #0" },
    { label: "∇⬚", latex: "\\nabla #0" },
    { label: "∇·⬚", latex: "\\nabla \\cdot #0" },
    { label: "Δ⬚", latex: "\\Delta #0" },
  ]},

  // Section 5: Integral symbol variants
  { cols: 2, items: [
    { label: "∫", latex: "\\int" },
    { label: "∬", latex: "\\iint" },
    { label: "∮", latex: "\\oint" },
    { label: "∯", latex: "\\oiint" },
  ], more: [
    { label: "∰", latex: "\\oiiint" },
    { label: "∭", latex: "\\iiint" },
  ], moreCols: 2 },

  // Section 6: Trig / log functions
  { cols: 3, items: [
    { label: "sin", latex: "\\sin(#?)" },
    { label: "cos", latex: "\\cos(#?)" },
    { label: "tan", latex: "\\tan(#?)" },
    { label: "log", latex: "\\log(#?)" },
    { label: "log⬚", latex: "\\log_{#0}(#?)" },
    { label: "ln", latex: "\\ln(#?)" },
  ], more: [
    { label: "csc", latex: "\\csc(#?)" }, { label: "sec", latex: "\\sec(#?)" }, { label: "cot", latex: "\\cot(#?)" },
    { label: "sin⁻¹", latex: "\\sin^{-1}(#?)" }, { label: "cos⁻¹", latex: "\\cos^{-1}(#?)" }, { label: "tan⁻¹", latex: "\\tan^{-1}(#?)" },
  ], moreCols: 3 },
];

const TABS = [
  { id: "frac",     icon: "√⬚",   groups: TAB1_GROUPS },
  { id: "rel",      icon: "∈∞",   groups: TAB2_GROUPS },
  { id: "arrows",   icon: "→∴",   groups: TAB3_GROUPS },
  { id: "greek",    icon: "αΩ",   groups: TAB4_GROUPS },
  { id: "matrices", icon: "⊞",    groups: TAB5_GROUPS },
  { id: "funcs",    icon: "Γ⬚",   groups: TAB6_GROUPS },
  { id: "delims",   icon: "(0)",   groups: TAB7_GROUPS },
  { id: "bigops",   icon: "ΣU",   groups: TAB8_GROUPS },
  { id: "calc",     icon: "∫lim", groups: TAB9_GROUPS },
];

const PERIODIC_ELEMENTS = [
  ["H",1,1,"nonmetal"], ["He",1,18,"noble"],
  ["Li",2,1,"alkali"], ["Be",2,2,"alkaline"], ["B",2,13,"metalloid"], ["C",2,14,"nonmetal"], ["N",2,15,"nonmetal"], ["O",2,16,"nonmetal"], ["F",2,17,"nonmetal"], ["Ne",2,18,"noble"],
  ["Na",3,1,"alkali"], ["Mg",3,2,"alkaline"], ["Al",3,13,"post"], ["Si",3,14,"metalloid"], ["P",3,15,"nonmetal"], ["S",3,16,"nonmetal"], ["Cl",3,17,"nonmetal"], ["Ar",3,18,"noble"],
  ["K",4,1,"alkali"], ["Ca",4,2,"alkaline"], ["Sc",4,3,"transition"], ["Ti",4,4,"transition"], ["V",4,5,"transition"], ["Cr",4,6,"transition"], ["Mn",4,7,"transition"], ["Fe",4,8,"transition"], ["Co",4,9,"transition"], ["Ni",4,10,"transition"], ["Cu",4,11,"transition"], ["Zn",4,12,"transition"], ["Ga",4,13,"post"], ["Ge",4,14,"metalloid"], ["As",4,15,"metalloid"], ["Se",4,16,"nonmetal"], ["Br",4,17,"nonmetal"], ["Kr",4,18,"noble"],
  ["Rb",5,1,"alkali"], ["Sr",5,2,"alkaline"], ["Y",5,3,"transition"], ["Zr",5,4,"transition"], ["Nb",5,5,"transition"], ["Mo",5,6,"transition"], ["Tc",5,7,"transition"], ["Ru",5,8,"transition"], ["Rh",5,9,"transition"], ["Pd",5,10,"transition"], ["Ag",5,11,"transition"], ["Cd",5,12,"transition"], ["In",5,13,"post"], ["Sn",5,14,"post"], ["Sb",5,15,"metalloid"], ["Te",5,16,"metalloid"], ["I",5,17,"nonmetal"], ["Xe",5,18,"noble"],
  ["Cs",6,1,"alkali"], ["Ba",6,2,"alkaline"], ["Hf",6,4,"transition"], ["Ta",6,5,"transition"], ["W",6,6,"transition"], ["Re",6,7,"transition"], ["Os",6,8,"transition"], ["Ir",6,9,"transition"], ["Pt",6,10,"transition"], ["Au",6,11,"transition"], ["Hg",6,12,"transition"], ["Tl",6,13,"post"], ["Pb",6,14,"post"], ["Bi",6,15,"post"], ["Po",6,16,"metalloid"], ["At",6,17,"metalloid"], ["Rn",6,18,"noble"],
  ["Fr",7,1,"alkali"], ["Ra",7,2,"alkaline"], ["Rf",7,4,"transition"], ["Db",7,5,"transition"], ["Sg",7,6,"transition"], ["Bh",7,7,"transition"], ["Hs",7,8,"transition"], ["Mt",7,9,"transition"], ["Ds",7,10,"transition"], ["Rg",7,11,"transition"], ["Cn",7,12,"transition"], ["Nh",7,13,"post"], ["Fl",7,14,"post"], ["Mc",7,15,"post"], ["Lv",7,16,"post"], ["Ts",7,17,"noble"], ["Og",7,18,"noble"],
  ["La",9,3,"lanth"], ["Ce",9,4,"lanth"], ["Pr",9,5,"lanth"], ["Nd",9,6,"lanth"], ["Pm",9,7,"lanth"], ["Sm",9,8,"lanth"], ["Eu",9,9,"lanth"], ["Gd",9,10,"lanth"], ["Tb",9,11,"lanth"], ["Dy",9,12,"lanth"], ["Ho",9,13,"lanth"], ["Er",9,14,"lanth"], ["Tm",9,15,"lanth"], ["Yb",9,16,"lanth"], ["Lu",9,17,"lanth"],
  ["Ac",10,3,"act"], ["Th",10,4,"act"], ["Pa",10,5,"act"], ["U",10,6,"act"], ["Np",10,7,"act"], ["Pu",10,8,"act"], ["Am",10,9,"act"], ["Cm",10,10,"act"], ["Bk",10,11,"act"], ["Cf",10,12,"act"], ["Es",10,13,"act"], ["Fm",10,14,"act"], ["Md",10,15,"act"], ["No",10,16,"act"], ["Lr",10,17,"act"],
];

const PERIODIC_ELEMENT_NAMES = {
  H: "Hydrogen", He: "Helium",
  Li: "Lithium", Be: "Beryllium", B: "Boron", C: "Carbon", N: "Nitrogen", O: "Oxygen", F: "Fluorine", Ne: "Neon",
  Na: "Sodium", Mg: "Magnesium", Al: "Aluminium", Si: "Silicon", P: "Phosphorus", S: "Sulfur", Cl: "Chlorine", Ar: "Argon",
  K: "Potassium", Ca: "Calcium", Sc: "Scandium", Ti: "Titanium", V: "Vanadium", Cr: "Chromium", Mn: "Manganese", Fe: "Iron", Co: "Cobalt", Ni: "Nickel", Cu: "Copper", Zn: "Zinc", Ga: "Gallium", Ge: "Germanium", As: "Arsenic", Se: "Selenium", Br: "Bromine", Kr: "Krypton",
  Rb: "Rubidium", Sr: "Strontium", Y: "Yttrium", Zr: "Zirconium", Nb: "Niobium", Mo: "Molybdenum", Tc: "Technetium", Ru: "Ruthenium", Rh: "Rhodium", Pd: "Palladium", Ag: "Silver", Cd: "Cadmium", In: "Indium", Sn: "Tin", Sb: "Antimony", Te: "Tellurium", I: "Iodine", Xe: "Xenon",
  Cs: "Caesium", Ba: "Barium", Hf: "Hafnium", Ta: "Tantalum", W: "Tungsten", Re: "Rhenium", Os: "Osmium", Ir: "Iridium", Pt: "Platinum", Au: "Gold", Hg: "Mercury", Tl: "Thallium", Pb: "Lead", Bi: "Bismuth", Po: "Polonium", At: "Astatine", Rn: "Radon",
  Fr: "Francium", Ra: "Radium", Rf: "Rutherfordium", Db: "Dubnium", Sg: "Seaborgium", Bh: "Bohrium", Hs: "Hassium", Mt: "Meitnerium", Ds: "Darmstadtium", Rg: "Roentgenium", Cn: "Copernicium", Nh: "Nihonium", Fl: "Flerovium", Mc: "Moscovium", Lv: "Livermorium", Ts: "Tennessine", Og: "Oganesson",
  La: "Lanthanum", Ce: "Cerium", Pr: "Praseodymium", Nd: "Neodymium", Pm: "Promethium", Sm: "Samarium", Eu: "Europium", Gd: "Gadolinium", Tb: "Terbium", Dy: "Dysprosium", Ho: "Holmium", Er: "Erbium", Tm: "Thulium", Yb: "Ytterbium", Lu: "Lutetium",
  Ac: "Actinium", Th: "Thorium", Pa: "Protactinium", U: "Uranium", Np: "Neptunium", Pu: "Plutonium", Am: "Americium", Cm: "Curium", Bk: "Berkelium", Cf: "Californium", Es: "Einsteinium", Fm: "Fermium", Md: "Mendelevium", No: "Nobelium", Lr: "Lawrencium",
};

const BOX_CHAR = "â¬š";

function renderLine(line) {
  if (line === BOX_CHAR) return <span className="mr-box" />;
  if (!line.includes(BOX_CHAR)) return line;
  return line.split(BOX_CHAR).map((part, i, arr) => (
    <span key={i}>
      {part}
      {i < arr.length - 1 && <span className="mr-box" />}
    </span>
  ));
}

function renderLabel(label) {
  if (!label) return label;
  if (!label.includes("\n")) return renderLine(label);
  const lines = label.split("\n");
  return (
    <span className="mr-stack">
      {lines.map((line, i) => (
        <span className="mr-stack-line" key={i}>
          {renderLine(line)}
        </span>
      ))}
    </span>
  );
}

function renderIcon(icon) {
  const svgProps = {
    className: "mr-template-svg",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false",
  };
  const accentBox = <rect x="26" y="32" width="18" height="28" stroke="#008A1E" strokeWidth="3" fill="none" />;
  const arrowTemplateIcon = (direction, topOperand, bottomOperand) => (
    <svg {...svgProps} className="mr-template-svg mr-arrow-template-svg" width="50" height="62" viewBox="0 0 50 62">
      {topOperand && (
        <rect x="19" y="1" width="10" height="18" fill="none" stroke="#6DAE68" strokeWidth="2" />
      )}
      {direction === "right" ? (
        <>
          <line x1="2" y1="31" x2="48" y2="31" stroke="#222" strokeWidth="3" />
          <polygon points="48,31 41,26 41,36" fill="#222" />
        </>
      ) : (
        <>
          <line x1="48" y1="31" x2="2" y2="31" stroke="#222" strokeWidth="3" />
          <polygon points="2,31 9,26 9,36" fill="#222" />
        </>
      )}
      {bottomOperand && (
        <rect x="19" y="43" width="10" height="18" fill="none" stroke="#6DAE68" strokeWidth="2" />
      )}
    </svg>
  );

  switch (icon) {
    case "addition-array-template-image":
      return (
        <svg {...svgProps} width="64" height="80" viewBox="0 0 64 80">
          <g stroke="#111" strokeWidth="3.5" strokeLinecap="square">
            <line x1="12" y1="32" x2="32" y2="32" />
            <line x1="22" y1="22" x2="22" y2="42" />
          </g>
          <line
            x1="8"
            y1="50"
            x2="43"
            y2="50"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="square"
          />
          <g fill="none" stroke="#168A2F" strokeWidth="3">
            <rect x="44" y="5" width="13" height="20" />
            <rect x="44" y="29" width="13" height="20" />
            <rect x="44" y="56" width="13" height="20" />
          </g>
        </svg>
      );
    case "long-division-template-image":
      return (
        <svg {...svgProps} width="64" height="80" viewBox="0 0 64 80">
          <rect x="42" y="4" width="14" height="20" fill="none" stroke="#118C22" strokeWidth="3" />
          <path
            d="M30 24 L34 28 Q39 38 39 54 Q39 66 31 76"
            fill="none"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="30"
            y1="24"
            x2="58"
            y2="24"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="4" y="42" width="14" height="20" fill="none" stroke="#118C22" strokeWidth="3" />
          <rect x="44" y="42" width="14" height="20" fill="none" stroke="#118C22" strokeWidth="3" />
        </svg>
      );
    case "blank-array-template-image":
      return (
        <svg {...svgProps} width="64" height="80" viewBox="0 0 64 80">
          <rect x="42" y="4" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
          <rect x="42" y="28" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
          <line
            x1="6"
            y1="52"
            x2="40"
            y2="52"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="42" y="54" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
        </svg>
      );
    case "subtraction-array-template-image":
      return (
        <svg {...svgProps} width="64" height="80" viewBox="0 0 64 80">
          <line
            x1="10"
            y1="34"
            x2="24"
            y2="34"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="42" y="4" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
          <rect x="42" y="28" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
          <line
            x1="6"
            y1="52"
            x2="40"
            y2="52"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="42" y="54" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
        </svg>
      );
    case "multiplication-array-template-image":
      return (
        <svg {...svgProps} width="64" height="80" viewBox="0 0 64 80">
          <g stroke="#111" strokeWidth="3.5" strokeLinecap="round">
            <line x1="12" y1="28" x2="24" y2="40" />
            <line x1="24" y1="28" x2="12" y2="40" />
          </g>
          <rect x="42" y="4" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
          <rect x="42" y="28" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
          <line
            x1="6"
            y1="52"
            x2="40"
            y2="52"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="42" y="54" width="14" height="18" fill="none" stroke="#138A28" strokeWidth="3" />
        </svg>
      );
    case "division-array-template-image":
      return (
        <svg {...svgProps} width="64" height="80" viewBox="0 0 64 80">
          <rect x="4" y="18" width="14" height="20" fill="none" stroke="#138A28" strokeWidth="3" />
          <rect x="46" y="18" width="14" height="20" fill="none" stroke="#138A28" strokeWidth="3" />
          <rect x="46" y="56" width="14" height="20" fill="none" stroke="#138A28" strokeWidth="3" />
          <g
            fill="none"
            stroke="#111"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="32" y1="6" x2="32" y2="48" />
            <line x1="32" y1="48" x2="58" y2="48" />
          </g>
        </svg>
      );
    case "division-four-box-template-image":
      return (
        <svg {...svgProps} width="80" height="80" viewBox="0 0 80 80">
          <g fill="none" stroke="#138A28" strokeWidth="3">
            <rect x="6" y="10" width="14" height="22" />
            <rect x="56" y="10" width="14" height="22" />
            <rect x="6" y="50" width="14" height="22" />
            <rect x="56" y="50" width="14" height="22" />
          </g>
          <g
            fill="none"
            stroke="#111"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="40" y1="2" x2="40" y2="42" />
            <line x1="40" y1="42" x2="74" y2="42" />
          </g>
        </svg>
      );
    case "long-division-stacked-template-image":
      return (
        <svg {...svgProps} width="64" height="90" viewBox="0 0 64 90">
          <g fill="none" stroke="#138A28" strokeWidth="3">
            <rect x="45" y="5" width="10" height="20" />
            <rect x="45" y="40" width="10" height="20" />
            <rect x="45" y="72" width="10" height="16" />
            <rect x="8" y="40" width="10" height="20" />
          </g>
          <path
            d="M30 32 H56"
            fill="none"
            stroke="#111"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M30 32 C36 42, 36 58, 28 68"
            fill="none"
            stroke="#111"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "xrightarrow-top-template-image":
      return arrowTemplateIcon("right", false, true);
    case "xrightarrow-bottom-template-image":
      return arrowTemplateIcon("right", true, false);
    case "xrightarrow-both-template-image":
      return arrowTemplateIcon("right", true, true);
    case "xrightarrow-under-custom-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="42" height="56" viewBox="0 0 42 56" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 10 H25 V6 L35 13 L25 20 V16 H6" fill="#222" />
          <rect x="12" y="24" width="14" height="26" fill="none" stroke="#148C2E" strokeWidth="3" />
        </svg>
      );
    case "xleftrightarrow-under-custom-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="42" height="56" viewBox="0 0 42 56" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12 L14 7 V10 H28 V7 L34 12 L28 17 V14 H14 V17 Z" fill="#222" />
          <rect x="14" y="22" width="14" height="24" fill="none" stroke="#148C2E" strokeWidth="3" />
        </svg>
      );
    case "overline-custom-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="42" height="56" viewBox="0 0 42 56" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="12" x2="32" y2="12" stroke="#222" strokeWidth="3.5" strokeLinecap="square" />
          <rect x="14" y="22" width="14" height="24" fill="none" stroke="#148C2E" strokeWidth="3" />
        </svg>
      );
    case "overrightharpoon-custom-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="42" height="56" viewBox="0 0 42 56" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12 H25 V8 L35 14 H8 Z" fill="#222" />
          <rect x="14" y="22" width="14" height="24" fill="none" stroke="#148C2E" strokeWidth="3" />
        </svg>
      );
    case "xleftarrow-top-template-image":
      return arrowTemplateIcon("left", false, true);
    case "xleftarrow-bottom-template-image":
      return arrowTemplateIcon("left", true, false);
    case "xleftarrow-both-template-image":
      return arrowTemplateIcon("left", true, true);
    case "leftrightarrow-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <rect x="51" y="10" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
          <path d="M25 75 H95 M35 65 L25 75 L35 85 M85 65 L95 75 L85 85" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "leftrightarrow-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <path d="M25 46 H95 M35 36 L25 46 L35 56 M85 36 L95 46 L85 56" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="51" y="78" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
        </svg>
      );
    case "leftrightarrow-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <rect x="51" y="10" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
          <path d="M25 60 H95 M35 50 L25 60 L35 70 M85 50 L95 60 L85 70" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="51" y="80" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
        </svg>
      );
    case "leftrightarrows-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <rect x="48" y="10" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
          <path d="M98 58 H28 M38 48 L28 58 L38 68" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 84 H98 M88 74 L98 84 L88 94" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "leftrightarrows-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <path d="M98 58 H28 M38 48 L28 58 L38 68" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28 84 H98 M88 74 L98 84 L88 94" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="55" y="90" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
        </svg>
      );
    case "leftrightarrows-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <rect x="55" y="10" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
          <path d="M105 58 H35 M45 48 L35 58 L45 68" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M35 84 H105 M95 74 L105 84 L95 94" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="55" y="90" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
        </svg>
      );
    case "rightleftarrows-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="256" height="256" viewBox="0 0 256 256">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="105" y="30" width="34" height="56" rx="2" stroke="#0a8f17" strokeWidth="6" />
            <path d="M55 112 H175 M155 94 L175 112 L155 130" stroke="#000" strokeWidth="7" />
            <path d="M175 145 H55 M75 127 L55 145 L75 163" stroke="#000" strokeWidth="7" />
          </g>
        </svg>
      );
    case "rightleftarrows-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="256" height="256" viewBox="0 0 256 256">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M54 112 H174 M154 94 L174 112 L154 130" stroke="#000" strokeWidth="7" />
            <path d="M174 145 H54 M74 127 L54 145 L74 163" stroke="#000" strokeWidth="7" />
            <rect x="105" y="172" width="34" height="56" rx="2" stroke="#0a8f17" strokeWidth="6" />
          </g>
        </svg>
      );
    case "rightleftarrows-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="256" height="256" viewBox="0 0 256 256">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="105" y="30" width="34" height="56" rx="2" stroke="#0a8f17" strokeWidth="6" />
            <path d="M55 112 H175 M155 94 L175 112 L155 130" stroke="#000" strokeWidth="7" />
            <path d="M175 145 H55 M75 127 L55 145 L75 163" stroke="#000" strokeWidth="7" />
            <rect x="105" y="172" width="34" height="56" rx="2" stroke="#0a8f17" strokeWidth="6" />
          </g>
        </svg>
      );
    case "leftrightharpoons-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="80" viewBox="0 0 64 80">
          <rect x="18" y="2" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
          <line x1="10" y1="34" x2="48" y2="34" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="18,30 10,34 18,34" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="46" x2="48" y2="46" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="40,46 48,46 40,50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "leftrightharpoons-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="80" viewBox="0 0 64 80">
          <line x1="10" y1="34" x2="48" y2="34" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="18,30 10,34 18,34" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="46" x2="48" y2="46" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="40,46 48,46 40,50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="27" y="52" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
        </svg>
      );
    case "leftrightharpoons-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="80" viewBox="0 0 64 80">
          <rect x="27" y="2" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
          <line x1="10" y1="34" x2="48" y2="34" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="18,30 10,34 18,34" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="46" x2="48" y2="46" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="40,46 48,46 40,50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="27" y="52" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
        </svg>
      );
    case "rightleftharpoons-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="80" viewBox="0 0 64 80">
          <rect x="18" y="2" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
          <line x1="10" y1="34" x2="48" y2="34" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="40,30 48,34 40,34" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="46" x2="48" y2="46" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="18,46 10,46 18,50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "rightleftharpoons-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="80" viewBox="0 0 64 80">
          <line x1="10" y1="34" x2="48" y2="34" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="40,30 48,34 40,34" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="46" x2="48" y2="46" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="18,46 10,46 18,50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="27" y="52" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
        </svg>
      );
    case "rightleftharpoons-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="80" viewBox="0 0 64 80">
          <rect x="27" y="2" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
          <line x1="10" y1="34" x2="48" y2="34" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="40,30 48,34 40,34" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="10" y1="46" x2="48" y2="46" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          <polyline points="18,46 10,46 18,50" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="27" y="52" width="10" height="18" fill="none" stroke="#59a35a" strokeWidth="2" />
        </svg>
      );
    case "right-over-short-left-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="64" viewBox="0 0 64 64">
          <rect x="28" y="3" width="8" height="14" rx="1" fill="none" stroke="#159b2c" strokeWidth="2" />
          <path d="M12 26H44M38 20L44 26L38 32" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 36H12M18 30L12 36L18 42" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "right-over-short-left-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="64" viewBox="0 0 64 64">
          <path d="M12 22H44M38 16L44 22L38 28" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 32H12M18 26L12 32L18 38" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28" y="44" width="8" height="14" rx="1" fill="none" stroke="#159b2c" strokeWidth="2" />
        </svg>
      );
    case "right-over-short-left-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="64" height="64" viewBox="0 0 64 64">
          <rect x="28" y="3" width="8" height="14" rx="1" fill="none" stroke="#159b2c" strokeWidth="2" />
          <path d="M12 22H44M38 16L44 22L38 28" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 32H12M18 26L12 32L18 38" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28" y="44" width="8" height="14" rx="1" fill="none" stroke="#159b2c" strokeWidth="2" />
        </svg>
      );
    case "short-right-over-left-over-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <rect x="51" y="10" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
          <path d="M45 58 H92 M82 48 L92 58 L82 68" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 84 H28 M38 74 L28 84 L38 94" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "short-right-over-left-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <path d="M45 44 H92 M82 34 L92 44 L82 54" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 70 H28 M38 60 L28 70 L38 80" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="51" y="82" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
        </svg>
      );
    case "short-right-over-left-over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-arrow-template-svg" width="120" height="120" viewBox="0 0 120 120">
          <rect x="51" y="10" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
          <path d="M45 52 H92 M82 42 L92 52 L82 62" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M75 76 H28 M38 66 L28 76 L38 86" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="51" y="84" width="18" height="30" fill="none" stroke="#6fb27a" strokeWidth="4" />
        </svg>
      );
    case "matrix-vertical-plain-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-matrix-template-svg" width="120" height="220" viewBox="0 0 120 220">
          <rect x="45" y="15" width="35" height="45" fill="none" stroke="#2f9b3a" strokeWidth="8" />
          <rect x="45" y="87" width="35" height="45" fill="none" stroke="#2f9b3a" strokeWidth="8" />
          <rect x="45" y="159" width="35" height="45" fill="none" stroke="#2f9b3a" strokeWidth="8" />
        </svg>
      );
    case "matrix-vertical-square-template-image":
  return (
    <svg {...svgProps} className="mr-template-svg mr-matrix-template-svg" width="150" height="160" viewBox="0 0 150 160">
      <path d="M38 8 H58 M38 8 V152 M38 152 H58" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="square" />
      <path d="M112 8 H92 M112 8 V152 M112 152 H92" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="square" />
      <rect x="61" y="14" width="30" height="56" fill="none" stroke="#21a13a" strokeWidth="7" />
      <rect x="61" y="90" width="30" height="56" fill="none" stroke="#21a13a" strokeWidth="7" />
    </svg>
  );
    case "matrix-vertical-round-template-image":
  return (
    <svg {...svgProps} className="mr-template-svg mr-matrix-template-svg" width="150" height="160" viewBox="0 0 150 160">
      <path d="M52 8 C20 38, 20 122, 52 152" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
      <path d="M98 8 C130 38, 130 122, 98 152" fill="none" stroke="#222" strokeWidth="8" strokeLinecap="round" />
      <rect x="61" y="14" width="30" height="56" fill="none" stroke="#21a13a" strokeWidth="7" />
      <rect x="61" y="90" width="30" height="56" fill="none" stroke="#21a13a" strokeWidth="7" />
    </svg>
  );
    case "matrix-horizontal-plain-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-matrix-template-svg mr-matrix-template-wide-svg" width="240" height="90" viewBox="0 0 240 90">
          <rect x="20" y="22" width="48" height="48" fill="none" stroke="#2f9b3a" strokeWidth="8" />
          <rect x="96" y="22" width="48" height="48" fill="none" stroke="#2f9b3a" strokeWidth="8" />
          <rect x="172" y="22" width="48" height="48" fill="none" stroke="#2f9b3a" strokeWidth="8" />
        </svg>
      );
    case "matrix-horizontal-square-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-matrix-template-svg mr-matrix-template-wide-svg" width="150" height="85" viewBox="0 0 150 85">
          <rect width="150" height="85" fill="#dfe9ec" />
          <path d="M25 15 H13 V70 H25" fill="none" stroke="#222" strokeWidth="5" stinrokeLinecap="square" />
          <path d="M125 15 H137 V70 H125" fill="none" stroke="#222" strokeWidth="5" strokeLinecap="square" />
          <rect x="48" y="28" width="20" height="34" fill="none" stroke="#21a13a" strokeWidth="5" />
          <rect x="88" y="28" width="20" height="34" fill="none" stroke="#21a13a" strokeWidth="5" />
        </svg>
      );
    case "matrix-horizontal-round-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-matrix-template-svg mr-matrix-template-wide-svg" width="150" height="85" viewBox="0 0 150 85">
          <rect width="150" height="85" fill="#dfe9ec" />
          <path d="M30 18 C18 26, 18 59, 30 67" fill="none" stroke="#222" strokeWidth="5" strokeLinecap="round" />
          <path d="M120 18 C132 26, 132 59, 120 67" fill="none" stroke="#222" strokeWidth="5" strokeLinecap="round" />
          <rect x="48" y="25" width="20" height="36" fill="none" stroke="#1f9d39" strokeWidth="5" />
          <rect x="88" y="25" width="20" height="36" fill="none" stroke="#1f9d39" strokeWidth="5" />
        </svg>
      );
    case "cases-left-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-cases-template-svg" width="330" height="450" viewBox="0 0 330 450">
          <text x="0" y="390" fontSize="430" fontFamily="Times New Roman" fill="#050505">{"{"}</text>
          <rect x="190" y="75" width="110" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <rect x="195" y="310" width="70" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
        </svg>
      );
    case "cases-piecewise-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-cases-template-svg mr-cases-template-wide-svg" width="490" height="450" viewBox="0 0 490 450">
          <text x="0" y="390" fontSize="430" fontFamily="Times New Roman" fill="#050505">{"{"}</text>
          <rect x="190" y="75" width="75" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <rect x="350" y="75" width="75" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <rect x="190" y="310" width="70" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <rect x="350" y="310" width="110" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
        </svg>
      );
    case "cases-right-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-cases-template-svg" width="430" height="450" viewBox="0 0 430 450">
          <rect x="80" y="90" width="70" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <rect x="45" y="295" width="110" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <text x="210" y="390" fontSize="430" fontFamily="Times New Roman" fill="#050505">{"}"}</text>
        </svg>
      );
    case "aligned-equations-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-cases-template-svg mr-cases-template-wide-svg" width="500" height="420" viewBox="0 0 500 420">
          <rect x="40" y="55" width="110" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <line x1="210" y1="95" x2="300" y2="95" stroke="#050505" strokeWidth="18" strokeLinecap="round" />
          <line x1="210" y1="130" x2="300" y2="130" stroke="#050505" strokeWidth="18" strokeLinecap="round" />
          <rect x="350" y="55" width="70" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <rect x="75" y="260" width="70" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
          <line x1="210" y1="300" x2="300" y2="300" stroke="#050505" strokeWidth="18" strokeLinecap="round" />
          <line x1="210" y1="335" x2="300" y2="335" stroke="#050505" strokeWidth="18" strokeLinecap="round" />
          <rect x="350" y="260" width="110" height="110" fill="none" stroke="#0b8f1a" strokeWidth="18" strokeLinejoin="round" />
        </svg>
      );
    case "fraction-template-image":
      return (
        <svg {...svgProps} width="64" height="96" viewBox="0 0 64 96">
          <rect width="64" height="96" fill="#eef3f5" />
          <rect x="25" y="14" width="18" height="26" fill="none" stroke="#1b8f2a" strokeWidth="3" />
          <line x1="18" y1="50" x2="47" y2="50" stroke="#111" strokeWidth="4" />
          <rect x="25" y="60" width="18" height="26" fill="none" stroke="#1b8f2a" strokeWidth="3" />
        </svg>
      );
    case "slash-fraction-template-image":
      return (
        <svg {...svgProps} width="256" height="256" viewBox="0 0 256 256">
          <rect x="38" y="58" width="58" height="86" rx="4" fill="none" stroke="#008000" strokeWidth="8" />
          <line x1="94" y1="191" x2="163" y2="48" stroke="#000" strokeWidth="8" strokeLinecap="round" />
          <rect x="161" y="98" width="50" height="86" rx="4" fill="none" stroke="#008000" strokeWidth="8" />
        </svg>
      );
    case "bevelled-fraction-template-image":
      return (
        <svg {...svgProps} width="72" height="72" viewBox="0 0 72 72">
          <rect width="72" height="72" fill="#eef3f5" />
          <rect x="12" y="12" width="18" height="22" fill="none" stroke="#1b8f2a" strokeWidth="3" />
          <line x1="28" y1="58" x2="46" y2="14" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <rect x="42" y="38" width="18" height="22" fill="none" stroke="#1b8f2a" strokeWidth="3" />
        </svg>
      );
    case "sqrt-template-image":
      return (
        <svg {...svgProps} width="70" height="45" viewBox="0 0 70 45">
          <g fill="none">
            <path
              d="M5 25 L13 38 L24 8 H58"
              stroke="#222"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="37" y="15" width="14" height="26" stroke="#008A1E" strokeWidth="3" />
          </g>
        </svg>
      );
    case "nth-root-template-image":
      return (
        <svg {...svgProps} width="75" height="55" viewBox="0 0 75 55">
          <g fill="none">
            <path
              d="M5 30 L13 43 L24 12 H58"
              stroke="#222"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="4" y="8" width="8" height="14" stroke="#7BC67E" strokeWidth="2.5" />
            <rect x="37" y="18" width="14" height="26" stroke="#008A1E" strokeWidth="3" />
          </g>
        </svg>
      );
    case "superscript-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-template-svg" width="32" height="42" viewBox="0 0 32 42">
          <rect x="16" y="2" width="10" height="18" fill="none" stroke="#9AC89A" strokeWidth="2.5" />
          <rect x="6" y="16" width="10" height="18" fill="none" stroke="#148C2E" strokeWidth="2.5" />
        </svg>
      );
    case "right-sup-sub-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-right-sup-sub-template-svg" width="44" height="72" viewBox="0 0 44 72">
          <rect x="6" y="22" width="12" height="28" fill="none" stroke="#118A2D" strokeWidth="2.5" />
          <rect x="18" y="12" width="10" height="18" fill="none" stroke="#8EBE8E" strokeWidth="2.5" />
          <rect x="18" y="42" width="10" height="18" fill="none" stroke="#8EBE8E" strokeWidth="2.5" />
        </svg>
      );
    case "subscript-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-script-template-svg" width="32" height="42" viewBox="0 0 32 42">
          <rect x="6" y="2" width="10" height="18" fill="none" stroke="#148C2E" strokeWidth="2.5" />
          <rect x="16" y="16" width="10" height="18" fill="none" stroke="#9AC89A" strokeWidth="2.5" />
        </svg>
      );
    case "left-sup-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-left-sup-template-svg" width="48" height="64" viewBox="0 0 48 64">
          <rect x="8" y="8" width="12" height="22" fill="none" stroke="#8DBF8D" strokeWidth="2.8" />
          <rect x="20" y="20" width="16" height="30" fill="none" stroke="#118A2D" strokeWidth="2.8" />
        </svg>
      );
    case "left-sup-sub-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-left-sup-sub-template-svg" width="48" height="72" viewBox="0 0 48 72">
          <rect x="8" y="8" width="12" height="20" fill="none" stroke="#9AC79A" strokeWidth="3" />
          <rect x="8" y="44" width="12" height="20" fill="none" stroke="#9AC79A" strokeWidth="3" />
          <rect x="20" y="20" width="16" height="28" fill="none" stroke="#138C2F" strokeWidth="3" />
        </svg>
      );
    case "left-sub-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-left-sub-template-svg" width="44" height="64" viewBox="0 0 44 64">
          <rect x="8" y="30" width="10" height="18" fill="none" stroke="#9BCB9B" strokeWidth="3" />
          <rect x="20" y="8" width="12" height="26" fill="none" stroke="#118A2D" strokeWidth="3" />
        </svg>
      );
    case "overset-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-over-under-script-template-svg" width="40" height="90" viewBox="0 0 40 90">
          <rect x="14" y="6" width="12" height="22" fill="none" stroke="#9AC79A" strokeWidth="3" />
          <rect x="10" y="44" width="20" height="28" fill="none" stroke="#118A2D" strokeWidth="3" />
        </svg>
      );
    case "underset-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-over-under-script-template-svg" width="40" height="90" viewBox="0 0 40 90">
          <rect x="10" y="12" width="20" height="28" fill="none" stroke="#118A2D" strokeWidth="3" />
          <rect x="14" y="58" width="12" height="22" fill="none" stroke="#9AC79A" strokeWidth="3" />
        </svg>
      );
    case "over-under-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-over-under-script-tall-template-svg" width="40" height="120" viewBox="0 0 40 120">
          <rect x="17" y="6" width="6" height="18" fill="none" stroke="#9AC79A" strokeWidth="3" />
          <rect x="10" y="48" width="20" height="22" fill="none" stroke="#118A2D" strokeWidth="3" />
          <rect x="17" y="94" width="6" height="18" fill="none" stroke="#9AC79A" strokeWidth="3" />
        </svg>
      );
    case "underbrace-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-funcs-brace-template-svg" width="50" height="100" viewBox="0 0 50 100">
          <rect x="16" y="5" width="18" height="30" fill="none" stroke="#008A1E" strokeWidth="3" />
          <path
            d="M10 45 C15 45 15 52 20 52 L30 52 C35 52 35 45 40 45"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
          <rect x="18" y="62" width="14" height="28" fill="none" stroke="#7BC67E" strokeWidth="3" />
        </svg>
      );
    case "overbrace-template-image":
      return (
        <svg {...svgProps} className="mr-template-svg mr-funcs-brace-template-svg" width="50" height="100" viewBox="0 0 50 100">
          <rect x="18" y="5" width="14" height="28" fill="none" stroke="#7BC67E" strokeWidth="3" />
          <path
            d="M10 45 C15 45 15 38 20 38 L30 38 C35 38 35 45 40 45"
            fill="none"
            stroke="#000"
            strokeWidth="2"
          />
          <rect x="16" y="55" width="18" height="30" fill="none" stroke="#008A1E" strokeWidth="3" />
        </svg>
      );
    case "digit-space-template-image":
      return (
        <svg {...svgProps} width="70" height="50" viewBox="0 0 90 70">
          <g fill="none" stroke="#008A1E" strokeWidth="3" strokeLinejoin="round">
            <rect x="18" y="20" width="14" height="27" />
            <rect x="58" y="20" width="14" height="27" />
          </g>
        </svg>
      );
    case "thin-space-template-image":
      return (
        <svg {...svgProps} width="70" height="50" viewBox="0 0 90 70">
          <g fill="none" stroke="#008A1E" strokeWidth="3" strokeLinejoin="round">
            <rect x="28" y="20" width="15" height="27" />
            <rect x="48" y="20" width="15" height="27" />
          </g>
        </svg>
      );
    case "negative-thin-space-template-image":
      return (
        <svg {...svgProps} width="70" height="50" viewBox="0 0 90 70">
          <g fill="none" stroke="#008A1E" strokeWidth="3" strokeLinejoin="round">
            <rect x="34" y="20" width="7" height="27" />
            <rect x="41" y="20" width="7" height="27" />
            <rect x="48" y="20" width="7" height="27" />
          </g>
        </svg>
      );
    case "paren-delimiter-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70">
          <g fill="none" strokeLinecap="square">
            <path d="M18 18 C12 24 12 46 18 52" stroke="#222" strokeWidth="3" />
            <rect x="28" y="21" width="14" height="28" stroke="#008A1E" strokeWidth="3" />
            <path d="M52 18 C58 24 58 46 52 52" stroke="#222" strokeWidth="3" />
          </g>
        </svg>
      );
    case "bar-delimiter-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70">
          <g fill="none" strokeLinecap="square">
            <line x1="18" y1="16" x2="18" y2="54" stroke="#222" strokeWidth="3" />
            <rect x="28" y="21" width="14" height="28" stroke="#008A1E" strokeWidth="3" />
            <line x1="52" y1="16" x2="52" y2="54" stroke="#222" strokeWidth="3" />
          </g>
        </svg>
      );
    case "angle-delimiter-template-image":
      return (
        <svg {...svgProps} width="60" height="40" viewBox="0 0 60 40">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 L6 20 L18 34" stroke="#333" strokeWidth="3" />
            <rect x="24" y="8" width="12" height="24" stroke="#008A1E" strokeWidth="3" />
            <path d="M42 6 L54 20 L42 34" stroke="#333" strokeWidth="3" />
          </g>
        </svg>
      );
    case "bracket-delimiter-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70">
          <g fill="none" strokeLinecap="square">
            <path d="M20 18 L14 18 L14 52 L20 52" stroke="#222" strokeWidth="3" />
            <rect x="28" y="21" width="14" height="28" stroke="#008A1E" strokeWidth="3" />
            <path d="M50 18 L56 18 L56 52 L50 52" stroke="#222" strokeWidth="3" />
          </g>
        </svg>
      );
    case "double-bar-delimiter-template-image":
      return (
        <svg {...svgProps} width="80" height="70" viewBox="0 0 80 70">
          <g fill="none" strokeLinecap="square">
            <line x1="16" y1="16" x2="16" y2="54" stroke="#222" strokeWidth="3" />
            <line x1="22" y1="16" x2="22" y2="54" stroke="#222" strokeWidth="3" />
            <rect x="34" y="21" width="14" height="28" stroke="#008A1E" strokeWidth="3" />
            <line x1="60" y1="16" x2="60" y2="54" stroke="#222" strokeWidth="3" />
            <line x1="66" y1="16" x2="66" y2="54" stroke="#222" strokeWidth="3" />
          </g>
        </svg>
      );
    case "brace-delimiter-template-image":
      return (
        <svg {...svgProps} width="82" height="70" viewBox="0 0 82 70">
          <g fill="none" strokeLinecap="square">
            <path
              d="M20 18 C15 18 15 25 18 29 C21 33 21 37 18 41 C15 45 15 52 20 52"
              stroke="#222"
              strokeWidth="3"
            />
            <rect x="32" y="21" width="14" height="28" stroke="#008A1E" strokeWidth="3" />
            <path
              d="M62 18 C67 18 67 25 64 29 C61 33 61 37 64 41 C67 45 67 52 62 52"
              stroke="#222"
              strokeWidth="3"
            />
          </g>
        </svg>
      );
    case "floor-delimiter-template-image":
      return (
        <svg {...svgProps} width="32" height="32" viewBox="0 0 32 32">
          <path d="M6 4V28H10" stroke="#000" strokeWidth="2.5" fill="none" />
          <path d="M26 4V28H22" stroke="#000" strokeWidth="2.5" fill="none" />
          <rect x="13" y="8" width="8" height="16" fill="none" stroke="#1f9d3a" strokeWidth="2.5" />
        </svg>
      );
    case "bra-ket-delimiter-template-image":
      return (
        <svg {...svgProps} width="48" height="24" viewBox="0 0 48 24" fill="none">
          <path
            d="M10 4 L4 12 L10 20"
            stroke="#222"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="12" y="5" width="8" height="14" stroke="#1E8E3E" strokeWidth="2" fill="none" />
          <line x1="24" y1="3" x2="24" y2="21" stroke="#222" strokeWidth="2" />
          <rect x="28" y="5" width="8" height="14" stroke="#1E8E3E" strokeWidth="2" fill="none" />
          <path
            d="M38 4 L44 12 L38 20"
            stroke="#222"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ceiling-delimiter-template-image":
      return (
        <svg {...svgProps} width="40" height="40" viewBox="0 0 40 40">
          <g fill="none">
            <path
              d="M8 6 H13 M8 6 V34"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="square"
            />
            <path
              d="M32 6 H27 M32 6 V34"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="square"
            />
            <rect x="15" y="9" width="10" height="16" stroke="#178A34" strokeWidth="3" />
          </g>
        </svg>
      );
    case "overbrace-plain-template-image":
      return (
        <svg {...svgProps} width="70" height="90" viewBox="0 0 76 110" fill="none">
          <path
            d="M10 35 C10 20 32 28 38 15 C44 28 66 20 66 35"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="20" y="48" width="32" height="56" stroke="#0B7D13" strokeWidth="4" />
        </svg>
      );
    case "overparen-template-image":
      return (
        <svg {...svgProps} width="70" height="90" viewBox="0 0 58 110" fill="none">
          <path
            d="M12 30 C22 18 37 18 46 30"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="14" y="48" width="32" height="56" stroke="#0B7D13" strokeWidth="4" />
        </svg>
      );
    case "underbrace-plain-template-image":
      return (
        <svg {...svgProps} width="70" height="90" viewBox="0 0 76 110" fill="none">
          <rect x="20" y="6" width="32" height="56" stroke="#0B7D13" strokeWidth="4" />
          <path
            d="M10 76 C10 91 32 83 38 96 C44 83 66 91 66 76"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "underparen-template-image":
      return (
        <svg {...svgProps} width="70" height="90" viewBox="0 0 58 110" fill="none">
          <rect x="14" y="6" width="32" height="56" stroke="#0B7D13" strokeWidth="4" />
          <path
            d="M12 78 C22 90 37 90 46 78"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "vec-accent-template-image":
      return (
        <svg {...svgProps} width="51" height="92" viewBox="0 0 51 92">
          <path d="M7 25 H28 V19 L42 27 H7 Z" fill="#111" />
          <rect x="16" y="41" width="19" height="39" fill="none" stroke="#15803d" strokeWidth="4" />
        </svg>
      );
    case "overrightarrow-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <path d="M16 20 H54 M47 14 L54 20 L47 26" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {accentBox}
        </svg>
      );
    case "overleftrightarrow-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <path d="M16 20 H54 M23 14 L16 20 L23 26 M47 14 L54 20 L47 26" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {accentBox}
        </svg>
      );
    case "bar-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <line x1="22" y1="20" x2="48" y2="20" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          {accentBox}
        </svg>
      );
    case "hat-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <path d="M24 24 L35 14 L46 24" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {accentBox}
        </svg>
      );
    case "tilde-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <path d="M22 21 C28 13 35 29 42 21 C45 17 47 17 50 20" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          {accentBox}
        </svg>
      );
    case "ddot-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <circle cx="29" cy="20" r="3" fill="#111" />
          <circle cx="41" cy="20" r="3" fill="#111" />
          {accentBox}
        </svg>
      );
    case "dot-accent-template-image":
      return (
        <svg {...svgProps} width="70" height="70" viewBox="0 0 70 70" fill="none">
          <circle cx="35" cy="20" r="3.5" fill="#111" />
          {accentBox}
        </svg>
      );
    case "overline-enclosure-template-image":
      return (
        <svg {...svgProps} width="70" height="86" viewBox="0 0 70 86" fill="none">
          <g strokeLinecap="square">
            <line x1="18" y1="10" x2="38" y2="10" stroke="#000" strokeWidth="4" />
            <rect x="20" y="28" width="24" height="42" stroke="#087000" strokeWidth="4" />
          </g>
        </svg>
      );
    case "left-bar-enclosure-template-image":
      return (
        <svg {...svgProps} width="70" height="86" viewBox="0 0 70 86" fill="none">
          <g strokeLinecap="square">
            <line x1="10" y1="10" x2="10" y2="70" stroke="#000" strokeWidth="4" />
            <rect x="24" y="28" width="24" height="42" stroke="#087000" strokeWidth="4" />
          </g>
        </svg>
      );
    case "boxed-enclosure-template-image":
      return (
        <svg {...svgProps} width="70" height="86" viewBox="0 0 70 86" fill="none">
          <g strokeLinecap="square">
            <rect x="10" y="8" width="46" height="64" stroke="#000" strokeWidth="4" />
            <rect x="24" y="28" width="24" height="42" stroke="#087000" strokeWidth="4" />
          </g>
        </svg>
      );
    case "underline-enclosure-template-image":
      return (
        <svg {...svgProps} width="70" height="86" viewBox="0 0 70 86" fill="none">
          <g strokeLinecap="square">
            <rect x="20" y="10" width="24" height="42" stroke="#087000" strokeWidth="4" />
            <line x1="18" y1="68" x2="44" y2="68" stroke="#000" strokeWidth="4" />
          </g>
        </svg>
      );
    case "right-bar-enclosure-template-image":
      return (
        <svg {...svgProps} width="70" height="86" viewBox="0 0 70 86" fill="none">
          <g strokeLinecap="square">
            <rect x="20" y="10" width="24" height="42" stroke="#087000" strokeWidth="4" />
            <line x1="56" y1="0" x2="56" y2="68" stroke="#000" strokeWidth="4" />
          </g>
        </svg>
      );
    case "circle-enclosure-template-image":
      return (
        <svg {...svgProps} width="70" height="86" viewBox="0 0 70 86" fill="none">
          <g strokeLinecap="square">
            <ellipse cx="34" cy="43" rx="28" ry="38" stroke="#000" strokeWidth="4" />
            <rect x="24" y="26" width="20" height="34" stroke="#087000" strokeWidth="4" />
          </g>
        </svg>
      );
    case "actuarial-enclosure-template-image":
      return (
        <svg {...svgProps} width="32" height="60" viewBox="0 0 32 60">
          <path d="M10 5 H28 V50" fill="none" stroke="#000" strokeWidth="3" />
          <rect x="5" y="14" width="13" height="28" fill="none" stroke="#00a020" strokeWidth="2" />
        </svg>
      );
    case "roundedbox-enclosure-template-image":
      return (
        <svg {...svgProps} width="36" height="70" viewBox="0 0 36 70">
          <rect x="5" y="10" width="26" height="55" rx="13" fill="none" stroke="#000" strokeWidth="3" />
          <rect x="11" y="22" width="14" height="30" fill="none" stroke="#00a020" strokeWidth="2" />
          <line x1="18" y1="7" x2="18" y2="10" stroke="#000" strokeWidth="3" />
        </svg>
      );
    case "updiagonalstrike-enclosure-template-image":
      return (
        <svg {...svgProps} width="40" height="50" viewBox="0 0 40 50">
          <rect x="12" y="10" width="16" height="20" fill="none" stroke="green" strokeWidth="3" />
          <line x1="10" y1="38" x2="30" y2="2" stroke="#000" strokeWidth="3" />
        </svg>
      );
    case "crossstrike-enclosure-template-image":
      return (
        <svg {...svgProps} width="40" height="50" viewBox="0 0 40 50">
          <rect x="12" y="10" width="16" height="20" fill="none" stroke="green" strokeWidth="3" />
          <line x1="2" y1="20" x2="38" y2="20" stroke="#000" strokeWidth="3" />
        </svg>
      );
    case "downdiagonalstrike-enclosure-template-image":
      return (
        <svg {...svgProps} width="40" height="50" viewBox="0 0 40 50">
          <rect x="12" y="10" width="16" height="20" fill="none" stroke="green" strokeWidth="3" />
          <line x1="8" y1="2" x2="30" y2="46" stroke="#000" strokeWidth="3" />
        </svg>
      );
    case "diagonal-cross-enclosure-template-image":
      return (
        <svg {...svgProps} width="50" height="80" viewBox="0 0 50 80">
          <rect x="17" y="20" width="16" height="40" fill="none" stroke="#008000" strokeWidth="4" />
          <line x1="15" y1="0" x2="35" y2="80" stroke="#000" strokeWidth="4" />
          <line x1="35" y1="0" x2="15" y2="80" stroke="#000" strokeWidth="4" />
        </svg>
      );
    case "horizontal-vertical-strike-enclosure-template-image":
      return (
        <svg {...svgProps} width="40" height="50" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="7" width="6" height="10" rx="1" stroke="#2E7D32" strokeWidth="2" fill="none" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="3" x2="12" y2="21" stroke="#666" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "verticalstrike-enclosure-template-image":
      return (
        <svg {...svgProps} width="40" height="60" viewBox="0 0 40 60">
          <line x1="20" y1="0" x2="20" y2="60" stroke="#000" strokeWidth="3" />
          <rect x="12" y="15" width="16" height="30" fill="none" stroke="#008000" strokeWidth="3" />
        </svg>
      );
    case "curved-root-enclosure-template-image":
      return (
        <svg {...svgProps} width="50" height="60" viewBox="0 0 50 60">
          <path
            d="M10 8 C24 20 24 40 10 52"
            fill="none"
            stroke="#222"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line x1="10" y1="8" x2="38" y2="8" stroke="#222" strokeWidth="3" strokeLinecap="round" />
          <rect x="25" y="18" width="14" height="26" fill="none" stroke="#008a1e" strokeWidth="3" />
        </svg>
      );
    case "sum-limits-both-template-image":
      return (
        <svg {...svgProps} width="60" height="80" viewBox="0 0 60 80">
          <text x="10" y="52" fontSize="52" fontFamily="Times New Roman">∑</text>
          <rect x="25" y="0" width="10" height="10" fill="none" stroke="#66BB6A" strokeWidth="2" />
          <rect x="25" y="68" width="10" height="10" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "sum-right-sup-sub-template-image":
      return (
        <svg {...svgProps} width="60" height="80" viewBox="0 0 60 80">
          <text x="10" y="52" fontSize="52" fontFamily="Times New Roman">∑</text>
          <rect x="25" y="68" width="10" height="10" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "sum-limits-under-template-image":
      return (
        <svg {...svgProps} width="60" height="80" viewBox="0 0 60 80">
          <text x="10" y="52" fontSize="52" fontFamily="Times New Roman">∑</text>
          <rect x="25" y="68" width="10" height="10" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "sum-right-sub-template-image":
  return (
    <svg {...svgProps} width="60" height="80" viewBox="0 0 60 80">
      <text x="10" y="52" fontSize="52" fontFamily="Times New Roman">∑</text>
      <rect x="42" y="58" width="10" height="10" fill="none" stroke="#66BB6A" strokeWidth="2" />
    </svg>
  );
    case "prod-limits-both-template-image":
      return (
        <svg {...svgProps} width="70" height="90" viewBox="0 0 70 90">
          <text x="14" y="58" fontSize="56" fontFamily="Times New Roman">∏</text>
          <rect x="30" y="2" width="10" height="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
          <rect x="30" y="74" width="10" height="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "prod-right-sup-sub-template-image":
      return (
        <svg {...svgProps} width="90" height="90" viewBox="0 0 90 90">
          <text x="10" y="58" fontSize="56" fontFamily="Times New Roman">∏</text>
          <rect x="62" y="8" width="14" height="14" fill="none" stroke="#66BB6A" strokeWidth="2" />
          <rect x="62" y="58" width="14" height="14" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "prod-limits-under-template-image":
      return (
        <svg {...svgProps} width="70" height="90" viewBox="0 0 70 90">
          <text x="14" y="58" fontSize="56" fontFamily="Times New Roman">∏</text>
          <rect x="30" y="74" width="10" height="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "prod-right-sub-template-image":
      return (
        <svg {...svgProps} width="90" height="90" viewBox="0 0 90 90">
          <text x="10" y="58" fontSize="56" fontFamily="Times New Roman">∏</text>
          <rect x="62" y="58" width="14" height="14" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "mathop-limits-both-template-image":
      return (
        <svg {...svgProps} width="50" height="80" viewBox="0 0 50 80">
          <rect x="15" y="20" width="20" height="30" fill="none" stroke="#000" strokeWidth="3" />
          <rect x="20" y="2" width="8" height="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
          <rect x="20" y="66" width="8" height="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "mathop-right-sup-sub-template-image":
      return (
        <svg {...svgProps} width="80" height="90" viewBox="0 0 80 90">
          <rect x="15" y="10" width="28" height="54" fill="none" stroke="#000" strokeWidth="3" />
          <rect x="54" y="4" width="12" height="16" fill="none" stroke="#66BB6A" strokeWidth="2" />
          <rect x="54" y="52" width="12" height="16" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "mathop-limits-under-template-image":
      return (
        <svg {...svgProps} width="50" height="80" viewBox="0 0 50 80">
          <rect x="15" y="20" width="20" height="30" fill="none" stroke="#000" strokeWidth="3" />
          <rect x="20" y="66" width="8" height="12" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "mathop-right-sub-template-image":
      return (
        <svg {...svgProps} width="80" height="90" viewBox="0 0 80 90">
          <rect x="15" y="10" width="28" height="54" fill="none" stroke="#000" strokeWidth="3" />
          <rect x="54" y="52" width="12" height="16" fill="none" stroke="#66BB6A" strokeWidth="2" />
        </svg>
      );
    case "integral-bounds-template-image":
      return (
        <svg {...svgProps} width="90" height="120" viewBox="0 0 90 120">
          <text x="8" y="88" fontSize="90" fontFamily="Times New Roman">∫</text>
          <rect x="58" y="6" width="14" height="22" fill="none" stroke="#6BA96B" strokeWidth="3" />
          <rect x="20" y="96" width="14" height="22" fill="none" stroke="#6BA96B" strokeWidth="3" />
        </svg>
      );
    case "integral-bounds-differential-template-image":
      return (
        <svg {...svgProps} width="190" height="120" viewBox="0 0 190 120">
          <text x="8" y="88" fontSize="90" fontFamily="Times New Roman">∫</text>
          <rect x="58" y="6" width="14" height="22" fill="none" stroke="#6BA96B" strokeWidth="3" />
          <rect x="20" y="96" width="14" height="22" fill="none" stroke="#6BA96B" strokeWidth="3" />
          <rect x="105" y="40" width="22" height="32" fill="none" stroke="#008000" strokeWidth="4" />
          <text x="137" y="73" fontSize="42" fontFamily="Times New Roman">d</text>
          <rect x="165" y="40" width="22" height="32" fill="none" stroke="#008000" strokeWidth="4" />
        </svg>
      );
    case "integral-lower-bound-template-image":
      return (
        <svg {...svgProps} width="90" height="120" viewBox="0 0 90 120">
          <text x="8" y="88" fontSize="90" fontFamily="Times New Roman">∫</text>
          <rect x="20" y="96" width="14" height="22" fill="none" stroke="#6BA96B" strokeWidth="3" />
        </svg>
      );
    case "integral-lower-bound-differential-template-image":
      return (
        <svg {...svgProps} width="190" height="120" viewBox="0 0 190 120">
          <text x="8" y="88" fontSize="90" fontFamily="Times New Roman">∫</text>
          <rect x="20" y="96" width="14" height="22" fill="none" stroke="#6BA96B" strokeWidth="3" />
          <rect x="105" y="40" width="22" height="32" fill="none" stroke="#008000" strokeWidth="4" />
          <text x="137" y="73" fontSize="42" fontFamily="Times New Roman">d</text>
          <rect x="165" y="40" width="22" height="32" fill="none" stroke="#008000" strokeWidth="4" />
        </svg>
      );
    case "operator-limits-both-template-image":
      return (
        <svg {...svgProps} width="60" height="100" viewBox="0 0 60 100">
          <rect x="25" y="5" width="10" height="20" fill="none" stroke="#6ab56f" strokeWidth="3" />
          <rect x="15" y="35" width="30" height="50" fill="none" stroke="#111" strokeWidth="3" />
          <rect x="25" y="90" width="10" height="20" fill="none" stroke="#6ab56f" strokeWidth="3" />
        </svg>
      );
    case "operator-right-sup-sub-template-image":
      return (
        <svg {...svgProps} width="90" height="120" viewBox="0 0 90 120">
          <rect x="10" y="10" width="45" height="85" fill="none" stroke="#111" strokeWidth="3" />
          <rect x="60" y="10" width="15" height="30" fill="none" stroke="#6ab56f" strokeWidth="3" />
          <rect x="60" y="80" width="15" height="30" fill="none" stroke="#6ab56f" strokeWidth="3" />
        </svg>
      );
    case "operator-lower-limit-template-image":
      return (
        <svg {...svgProps} width="60" height="100" viewBox="0 0 60 100">
          <rect x="15" y="15" width="30" height="55" fill="none" stroke="#111" strokeWidth="3" />
          <rect x="25" y="80" width="10" height="20" fill="none" stroke="#6ab56f" strokeWidth="3" />
        </svg>
      );
    case "operator-right-sub-template-image":
      return (
        <svg {...svgProps} width="90" height="120" viewBox="0 0 90 120">
          <rect x="10" y="10" width="45" height="85" fill="none" stroke="#111" strokeWidth="3" />
          <rect x="60" y="80" width="15" height="30" fill="none" stroke="#6ab56f" strokeWidth="3" />
        </svg>
      );
    default:
      return null;
  }
}

function renderItemContent(item) {
  const icon = renderIcon(item?.icon);
  return icon || renderLabel(item?.label);
}

function buildMatrixLatex(type, rows, cols) {
  const body = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "#?").join(" & ")
  ).join(" \\\\ ");
  return `\\begin{${type}} ${body} \\end{${type}}`;
}

// â”€â”€ InlineMatrixPicker (Tab 5 first group) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MATRIX_TYPES = [
  { id: "matrix",  display: "M"   },
  { id: "vmatrix", display: "|M|" },
  { id: "bmatrix", display: "[M]" },
  { id: "pmatrix", display: "(M)" },
];

function InlineMatrixPicker({ onInsert }) {
  const [activeType, setActiveType] = useState("matrix");
  const [size, setSize] = useState({ rows: 2, cols: 2 });
  const [hover, setHover] = useState(null);

  const displaySize = hover || size;

  const changeSize = (dim, delta) =>
    setSize(prev => ({ ...prev, [dim]: Math.min(10, Math.max(1, prev[dim] + delta)) }));

  return (
    <div className="mr-matrix-inline-wrap">
      <div className="mr-matrix-inline-left">
        <div className="mr-matrix-type-btns">
          {MATRIX_TYPES.map(t => (
            <button key={t.id} type="button"
              className={`mr-matrix-type-btn${activeType === t.id ? " active" : ""}`}
              onMouseDown={e => { e.preventDefault(); setActiveType(t.id); }}
            >{t.display}</button>
          ))}
        </div>
        <div className="mr-matrix-inline-grid" onMouseLeave={() => setHover(null)}>
          {Array.from({ length: 6 }, (_, r) => (
            <div className="mr-matrix-inline-row" key={r}>
              {Array.from({ length: 6 }, (_, c) => (
                <button key={c} type="button"
                  className={`mr-matrix-inline-cell${r < displaySize.rows && c < displaySize.cols ? " selected" : ""}`}
                  onMouseEnter={() => setHover({ rows: r + 1, cols: c + 1 })}
                  onMouseDown={e => {
                    e.preventDefault();
                    const nextSize = { rows: r + 1, cols: c + 1 };
                    setSize(nextSize);
                    setHover(null);
                    onInsert?.(buildMatrixLatex(activeType, nextSize.rows, nextSize.cols));
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mr-matrix-inline-footer">
        {[["rows", "Rows"], ["cols", "Cols"]].map(([dim, lbl]) => (
          <div key={dim} className="mr-matrix-inline-counter">
            <span className="mr-matrix-inline-label">{lbl}</span>
            <span className="mr-matrix-inline-val">{size[dim]}</span>
            <span className="mr-matrix-inline-steppers">
              <button type="button" aria-label={`Increase ${lbl.toLowerCase()}`} title={`Increase ${lbl.toLowerCase()}`} onMouseDown={e => e.preventDefault()} onClick={() => changeSize(dim, 1)}>▲</button>
              <button type="button" aria-label={`Decrease ${lbl.toLowerCase()}`} title={`Decrease ${lbl.toLowerCase()}`} onMouseDown={e => e.preventDefault()} onClick={() => changeSize(dim, -1)}>▼</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€ Old popup MatrixPicker (kept for any remaining matrixType buttons) â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MatrixPicker({ matrixType, position, onInsert }) {
  const [size, setSize] = useState({ rows: 2, cols: 2 });
  const names = {
    matrix: "Plain Matrix",
    bmatrix: "Square Matrix",
    pmatrix: "Parenthesis Matrix",
    vmatrix: "Vertical Matrix",
  };

  const changeSize = (dimension, amount) => {
    setSize(current => ({
      ...current,
      [dimension]: Math.min(10, Math.max(1, current[dimension] + amount)),
    }));
  };

  return (
    <div
      className="mr-matrix-picker"
      style={{ left: position.left, top: position.top }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="mr-matrix-title">{names[matrixType]}</div>
      <div className="mr-matrix-grid">
        {Array.from({ length: 6 }, (_, row) => (
          <div className="mr-matrix-row" key={row}>
            {Array.from({ length: 6 }, (_, col) => {
              const selected = row < size.rows && col < size.cols;
              return (
                <button
                  type="button"
                  aria-label={`Insert ${row + 1} by ${col + 1} ${names[matrixType]}`}
                  className={`mr-matrix-cell${selected ? " selected" : ""}`}
                  key={col}
                  onMouseEnter={() => setSize({ rows: row + 1, cols: col + 1 })}
                  onMouseDown={e => { e.preventDefault(); onInsert(row + 1, col + 1); }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mr-matrix-footer">
        {[["rows", "Rows"], ["cols", "Cols"]].map(([dimension, label]) => (
          <div className="mr-matrix-counter" key={dimension}>
            <span>{label}</span>
            <span className="mr-matrix-value">{size[dimension]}</span>
            <span className="mr-matrix-steppers">
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => changeSize(dimension, 1)}>â–²</button>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => changeSize(dimension, -1)}>â–¼</button>
            </span>
          </div>
        ))}
        <button
          type="button"
          className="mr-matrix-insert"
          onMouseDown={e => { e.preventDefault(); onInsert(size.rows, size.cols); }}
        >
          Insert
        </button>
      </div>
    </div>
  );
}

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function MathRibbon({ onInsert, onCommand }) {
  const [activeTab, setActiveTab] = useState("frac");
  const [openGroup, setOpenGroup] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 });
  const [lastUsed, setLastUsed] = useState(null);
  const [matrixPicker, setMatrixPicker] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenGroup(null);
        setMatrixPicker(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const activeTabData = TABS.find(t => t.id === activeTab);

  const handleItemClick = (item, event) => {
    if (!item) return;
    if (item.command) {
      onCommand?.(item.command);
    } else if (item.action === "SPECIAL_CHARS") {
      const rect = event?.currentTarget?.getBoundingClientRect();
      onCommand?.(
        "special-chars",
        rect ? { x: rect.right + 4, y: rect.top } : undefined
      );
        } else if (item.latex) {
      onInsert?.(item.latex);
      setLastUsed(item);
    }
    setOpenGroup(null);
  };

  const openMatrixPicker = (item, button) => {
    const buttonRect = button.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    const pickerWidth = 235;
    const idealLeft = buttonRect.left - rootRect.left + buttonRect.width / 2;
    setMatrixPicker({
      type: item.matrixType,
      left: Math.min(rootRect.width - pickerWidth / 2, Math.max(pickerWidth / 2, idealLeft)),
      top: buttonRect.bottom - rootRect.top + 4,
    });
    setOpenGroup(null);
  };

  const insertMatrix = (rows, cols) => {
    onInsert?.(buildMatrixLatex(matrixPicker.type, rows, cols));
    setMatrixPicker(null);
  };

  const openDropdown = (gi, e) => {
    if (openGroup === gi) { setOpenGroup(null); return; }
    const group = activeTabData.groups[gi];
    const arrowRect = e.currentTarget.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    const dropdownCols = group.moreCols || group.cols;
    const dropdownCellWidth = group.moreCellWidth || 30;
    const dropdownGap = group.moreCellGap ?? 1;
    const dropdownWidth =
      group.type === "periodic-table"
        ? 18 * 24 + 17 * 2 + 8
        : dropdownCols * dropdownCellWidth + Math.max(0, dropdownCols - 1) * dropdownGap + 8;
    let left = arrowRect.left - rootRect.left;
    if (left + dropdownWidth > rootRect.width) left = Math.max(0, rootRect.width - dropdownWidth);
    setDropdownPos({ left, top: arrowRect.bottom - rootRect.top + 2 });
    setOpenGroup(gi);
  };

  const openGroupData = openGroup !== null ? activeTabData.groups[openGroup] : null;
  const getItemButtonStyle = (item) =>
    item?.value === undefined ? undefined : { fontSize: `${getArrowFontSize(item.value)}px` };

  return (
    <div className={`mr-root mr-tab-${activeTab}`} ref={rootRef}>
      <div className="mr-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`mr-tab${activeTab === tab.id ? " active" : ""}`}
            onMouseDown={e => {
              e.preventDefault();
              setActiveTab(tab.id);
              setOpenGroup(null);
              setMatrixPicker(null);
            }}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="mr-groups">
        {activeTabData.groups.map((group, gi) => {

          // Inline matrix picker (Tab 5, first group)
          if (group.type === "inline-matrix-picker") {
            return (
              <div className="mr-group" key={gi}>
                <InlineMatrixPicker onInsert={onInsert} />
              </div>
            );
          }

          const isPreview = group.type === "periodic-table";
          return (
            <div className={`mr-group${group.groupClass ? ` ${group.groupClass}` : ""}`} key={gi}>
              <div
                className={isPreview ? "mr-grid mr-grid-preview" : "mr-grid"}
                style={{
                  "--mr-cols": group.cols,
                  "--mr-cell": group.cellWidth ? `${group.cellWidth}px` : undefined,
                  "--mr-gap": group.cellGap ? `${group.cellGap}px` : undefined,
                }}
              >
                {group.items.map((item, ii) => {
                  const displayItem = item.pinned && lastUsed ? lastUsed : item;
                  return (
                    <button
                      key={ii}
                      type="button"
                       className={`mr-btn${item.pinned ? " pinned" : ""}${isPreview ? " mr-btn-preview" : ""}`}
                      style={getItemButtonStyle(displayItem)}
                      title={item.latex || item.matrixType || item.command || ""}
                      onMouseDown={e => {
                        e.preventDefault();
                        const selectedItem = item.pinned ? lastUsed || item : item;
                        if (selectedItem.matrixType) {
                          openMatrixPicker(selectedItem, e.currentTarget);
                        } else {
                          handleItemClick(selectedItem, e);
                        }
                      }}
                    >
                      {renderItemContent(displayItem)}
                    </button>
                  );
                })}
              </div>

              {((group.more && group.more.length > 0) || group.type === "periodic-table") && (
                <button
                  type="button"
                  className={`mr-more-arrow${openGroup === gi ? " open" : ""}`}
                  aria-label={openGroup === gi ? "Close more symbols" : "Show more symbols"}
                  title={openGroup === gi ? "Close more symbols" : "Show more symbols"}
                  onMouseDown={e => { e.preventDefault(); openDropdown(gi, e); }}
                >
                  {openGroup === gi ? "▴" : "▾"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {matrixPicker && (
        <MatrixPicker
          key={matrixPicker.type}
          matrixType={matrixPicker.type}
          position={matrixPicker}
          onInsert={insertMatrix}
        />
      )}

      {openGroupData && (
        <div
          className={`mr-dropdown${openGroupData.dropdownClass ? ` ${openGroupData.dropdownClass}` : ""}`}
          style={{ left: dropdownPos.left, top: dropdownPos.top }}
        >
          {openGroupData.type === "periodic-table" ? (
            <div className="mr-periodic">
              {PERIODIC_ELEMENTS.map(([symbol, row, col, category]) => {
                const elementName = PERIODIC_ELEMENT_NAMES[symbol] || symbol;

                return (
                  <button
                    key={symbol}
                    type="button"
                    className={`mr-pt-el mr-pt-${category}`}
                    style={{ gridRow: row, gridColumn: col }}
                    title={elementName}
                    aria-label={`Insert ${elementName}`}
                    onMouseDown={e => {
                      e.preventDefault();
                      handleItemClick({ latex: `\\text{${symbol}}` });
                    }}
                  >
                    {symbol}
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className="mr-grid"
              style={{
                "--mr-cols": openGroupData.moreCols || openGroupData.cols,
                "--mr-cell": openGroupData.moreCellWidth
                  ? `${openGroupData.moreCellWidth}px`
                  : undefined,
                "--mr-gap": openGroupData.moreCellGap
                  ? `${openGroupData.moreCellGap}px`
                  : undefined,
              }}
            >
              {openGroupData.more.map((item, ii) =>
                item ? (
                  <button
                    key={ii}
                    type="button"
                    className="mr-btn"
                    style={getItemButtonStyle(item)}
                    title={item.latex}
                    onMouseDown={e => { e.preventDefault(); handleItemClick(item, e); }}
                  >
                    {renderItemContent(item)}
                  </button>
                ) : (
                  <span key={ii} className="mr-btn-empty" />
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

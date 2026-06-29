import {
  actionControl,
  FRACTION_TEMPLATE,
  formatControl,
  paletteTrigger,
  scriptTemplate,
  spacer,
  visualControl,
} from "./symbolTemplates";

const formula = (display, label = display) => ({
  type: "formula",
  label,
  display,
});

const fractionPalette = paletteTrigger("general-fractions", FRACTION_TEMPLATE, [
  FRACTION_TEMPLATE,
  formula("□/□"),
  formula("(□)/(□)", "(□)/(□)"),
  "½",
  "⅓",
  "⅔",
  "¼",
  "¾",
]);

const rootPalette = paletteTrigger("general-roots", formula("√□"), [
  formula("√□"),
  formula("□√□"),
  formula("∛□"),
  formula("∜□"),
  formula("√(□)"),
]);

const scriptPalette = paletteTrigger(
  "general-scripts",
  scriptTemplate("sup", "Superscript fill-in template"),
  [
    scriptTemplate("sup", "Superscript fill-in template"),
    scriptTemplate("sub", "Subscript fill-in template"),
    scriptTemplate("sub-sup", "Subscript and superscript fill-in template"),
    formula("□²"),
    formula("□^□"),
    formula("□_□"),
    formula("□_□^□"),
  ]
);

const bracketsPalette = paletteTrigger("general-brackets", formula("(□)"), [
  formula("(□)"),
  formula("[□]"),
  formula("{□}"),
  formula("|□|"),
  formula("‖□‖"),
  formula("⟨□⟩"),
  formula("⌈□⌉"),
  formula("⌊□⌋"),
]);

const operatorsPalette = paletteTrigger("general-operators", "+", [
  "+",
  "×",
  "−",
  "±",
  "÷",
  "∓",
  "∗",
  "∙",
  "∘",
]);

const relationsPalette = paletteTrigger("general-relations", ">", [
  ">",
  "≤",
  "≥",
  "<",
  "=",
  "≠",
  "≈",
  "≡",
  "∈",
  "⊂",
  "∪",
  "∩",
]);

const symbolsPalette = paletteTrigger("general-symbols", "∞", [
  "∞",
  "π",
  "∅",
  "Ø",
  "∂",
  "Δ",
  "∇",
  "°",
  "′",
  "″",
]);

const editingPalette = paletteTrigger("general-editing", actionControl("undo", "↶", "Undo"), [
  actionControl("undo", "↶", "Undo"),
  actionControl("redo", "↷", "Redo"),
  actionControl("clear-draft", "↺", "Clear draft"),
  actionControl("backspace", "⌫", "Backspace"),
  actionControl("delete", "⌦", "Delete"),
]);

export const BASIC_SCREENSHOT_SECTIONS = [
  [
    fractionPalette,
    spacer("fraction-middle"),
    formula("□/□"),
  ],
  [
    rootPalette,
    spacer("root-middle"),
    formula("□√□"),
  ],
  [
    scriptPalette,
    spacer("script-middle"),
    scriptTemplate("sub-sup", "Subscript and superscript fill-in template"),
  ],
  [
    bracketsPalette,
    spacer("round-bracket-middle"),
    formula("|□|"),
    formula("[□]"),
    spacer("square-bracket-middle"),
    formula("{□}"),
  ],
  [
    operatorsPalette, "×", "−",
    "±", spacer("division-top"), "÷",
    relationsPalette, "∈", "∪",
    "≤", "⊂", "∩",
    symbolsPalette, spacer("pi-middle"), "π",
  ],
  [
    "Ø", "∞", "⌀",
    editingPalette, spacer("undo-middle"), "↷",
  ],
  [
    formatControl("bold", "B", "Bold"),
    formatControl("color", "A", "Color"),
    formatControl("italic", "1b", "Italic"),
    formatControl("math-style", "ω", "Math style"),
    { type: "symbol-panel-trigger", id: "symbol-panel", label: "Ω" },
    formatControl("text", "T", "Text style"),
  ],
  [
    visualControl("font", "Font..."),
    spacer("font-middle"),
    visualControl("size", "Size"),
  ],
];

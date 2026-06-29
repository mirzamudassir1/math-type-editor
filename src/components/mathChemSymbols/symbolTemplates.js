export const spacer = (id) => ({ type: "spacer", id });

export const visualControl = (id, label) => ({
  type: "visual-control",
  id,
  label,
});

export const formatControl = (id, label, title = label) => ({
  type: "format-control",
  id,
  label,
  title,
});

export const actionControl = (id, label, title = label) => ({
  type: "action-control",
  id,
  label,
  title,
});

export const paletteTrigger = (id, preview, items) => ({
  type: "palette-trigger",
  id,
  preview,
  items,
  label: typeof preview === "string" ? preview : preview.label,
});

export const arrowTemplate = (arrow, slots, label) => ({
  type: "labeled-arrow",
  arrow,
  slots,
  label,
});

export const FRACTION_TEMPLATE = {
  type: "fraction-template",
  label: "Stacked fraction",
};

export const scriptTemplate = (variant, label) => ({
  type: "script-template",
  variant,
  label,
});

export const stackedOperatorTemplate = (operator, variant, label) => ({
  type: "stacked-operator-template",
  operator,
  variant,
  label,
});

export const accentTemplate = (accent, label) => ({
  type: "accent-template",
  accent,
  label,
});

export const SCRIPT_TEMPLATES = [
  scriptTemplate("sup", "Superscript fill-in template"),
  scriptTemplate("sub", "Subscript fill-in template"),
  scriptTemplate("sub-sup", "Subscript and superscript fill-in template"),
];

export const ARROW_TEMPLATES = [
  arrowTemplate("\u2192", ["above"], "Right arrow with blank above"),
  arrowTemplate("\u2192", ["below"], "Right arrow with blank below"),
  arrowTemplate("\u2192", ["above", "below"], "Right arrow with two blanks"),
  arrowTemplate("\u2190", ["above"], "Left arrow with blank above"),
  arrowTemplate("\u2190", ["below"], "Left arrow with blank below"),
  arrowTemplate("\u2190", ["above", "below"], "Left arrow with two blanks"),
  arrowTemplate("\u21cc", ["above", "below"], "Equilibrium arrow with two blanks"),
  arrowTemplate("\u21d2", ["above"], "Double right arrow with blank above"),
  arrowTemplate("\u21d2", ["below"], "Double right arrow with blank below"),
  arrowTemplate("\u21d2", ["above", "below"], "Double right arrow with two blanks"),
  arrowTemplate("\u21d0", ["above"], "Double left arrow with blank above"),
  arrowTemplate("\u21d0", ["below"], "Double left arrow with blank below"),
  arrowTemplate("\u21d0", ["above", "below"], "Double left arrow with two blanks"),
  arrowTemplate("\u21d4", ["above"], "Double both-way arrow with blank above"),
  arrowTemplate("\u21d4", ["below"], "Double both-way arrow with blank below"),
  arrowTemplate("\u21d4", ["above", "below"], "Double both-way arrow with two blanks"),
  arrowTemplate("\u2194", ["above"], "Both-way arrow with blank above"),
  arrowTemplate("\u2194", ["below"], "Both-way arrow with blank below"),
  arrowTemplate("\u2194", ["above", "below"], "Both-way arrow with two blanks"),
  arrowTemplate("\u21c4", ["above", "below"], "Right-left paired arrows with two blanks"),
  arrowTemplate("\u21c6", ["above", "below"], "Left-right paired arrows with two blanks"),
];

export const STACKED_OPERATOR_TEMPLATES = [
  stackedOperatorTemplate("+", "over", "Plus with overscript"),
  stackedOperatorTemplate("+", "under", "Plus with underscript"),
  stackedOperatorTemplate("+", "under-over", "Plus with under and over"),
  stackedOperatorTemplate("∑", "over", "Summation with overscript"),
  stackedOperatorTemplate("∑", "under", "Summation with underscript"),
  stackedOperatorTemplate("∑", "sup", "Summation with superscript"),
  stackedOperatorTemplate("∑", "sub", "Summation with subscript"),
  stackedOperatorTemplate("∑", "under-over", "Big operator with under and over"),
  stackedOperatorTemplate("∑", "sub-sup", "Big operator with subscript and superscript"),
  stackedOperatorTemplate("∏", "over", "Product with overscript"),
  stackedOperatorTemplate("∏", "under", "Product with underscript"),
  stackedOperatorTemplate("∏", "sup", "Product with superscript"),
  stackedOperatorTemplate("∏", "sub", "Product with subscript"),
  stackedOperatorTemplate("∏", "under-over", "Product with under and over"),
  stackedOperatorTemplate("∏", "sub-sup", "Product with subscript and superscript"),
  stackedOperatorTemplate("Π", "sup", "Pi with superscript"),
  stackedOperatorTemplate("Π", "sub", "Pi with subscript"),
  stackedOperatorTemplate("Π", "sub-sup", "Pi with subscript and superscript"),
  stackedOperatorTemplate("lim", "under-over", "Operator with underscript and overscript"),
  stackedOperatorTemplate("lim", "under", "Operator with underscript"),
  stackedOperatorTemplate("lim", "sup", "Operator with superscript"),
];

export const DOT_LAYOUT_TEMPLATES = [
  { type: "formula", label: "⋮", display: "⋮" },
  { type: "formula", label: "⋯", display: "⋯" },
  { type: "formula", label: "⋰", display: "⋰" },
  { type: "formula", label: "⋱", display: "⋱" },
];

export const ACCENT_TEMPLATES = [
  accentTemplate("bar", "Bar accent fill-in template"),
  accentTemplate("underbar", "Underbar fill-in template"),
  accentTemplate("hat", "Hat accent fill-in template"),
  accentTemplate("tilde", "Tilde accent fill-in template"),
  accentTemplate("dot", "Dot accent fill-in template"),
  accentTemplate("double-dot", "Double dot accent fill-in template"),
  accentTemplate("right-arrow", "Right arrow accent fill-in template"),
  accentTemplate("left-arrow", "Left arrow accent fill-in template"),
  accentTemplate("double-arrow", "Double arrow accent fill-in template"),
  accentTemplate("left-bar", "Left bar enclosure fill-in template"),
  accentTemplate("right-bar", "Right bar enclosure fill-in template"),
  accentTemplate("box", "Box enclosure fill-in template"),
  accentTemplate("circle", "Circle enclosure fill-in template"),
  accentTemplate("slash", "Slash cancel fill-in template"),
  accentTemplate("cross", "Cross cancel fill-in template"),
];

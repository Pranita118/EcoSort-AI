export const WASTE_CATEGORIES = [
  "Wet / Organic Waste",
  "Dry Waste",
  "Recyclable Waste",
  "E-Waste",
  "Hazardous Waste",
  "Glass Waste",
  "Metal Waste",
  "Textile Waste",
  "Sanitary Waste",
  "Other / Uncertain"
];

export const CATEGORY_STYLE = {
  "Wet / Organic Waste": { color: "#357A52", bg: "#EEF4EF", icon: "leaf" },
  "Dry Waste": { color: "#8A6D3B", bg: "#F4EEE1", icon: "package" },
  "Recyclable Waste": { color: "#1F5C3D", bg: "#E4EFE7", icon: "recycle" },
  "E-Waste": { color: "#3B5B9C", bg: "#E7EBF6", icon: "cpu" },
  "Hazardous Waste": { color: "#B5482E", bg: "#F7E7E2", icon: "triangle-alert" },
  "Glass Waste": { color: "#2E8C8C", bg: "#E4F2F2", icon: "wine" },
  "Metal Waste": { color: "#6B6B6B", bg: "#ECECEC", icon: "nut" },
  "Textile Waste": { color: "#9C3D54", bg: "#F5E5E9", icon: "shirt" },
  "Sanitary Waste": { color: "#8A3D9C", bg: "#F0E5F5", icon: "droplets" },
  "Other / Uncertain": { color: "#5C5C52", bg: "#EFEFE9", icon: "help-circle" }
};

export function confidenceLabelFor(score) {
  if (score >= 75) return { level: "high", label: "High confidence" };
  if (score >= 45) return { level: "medium", label: "Moderate confidence — please verify local disposal rules." };
  return { level: "low", label: "Low confidence — EcoSort could not confidently identify this item." };
}
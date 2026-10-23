// Bar colour for the /manage/analytics charts, one step per colour scheme.
// Both validated against their surface (lightness band, >= 3:1 contrast).
// A plain object (not a theme function) so Server Components can use it too.
export const analyticsBarSx = {
  bgcolor: "#0340d8",
  '[data-mui-color-scheme="dark"] &': { bgcolor: "#6f8bf0" },
} as const;

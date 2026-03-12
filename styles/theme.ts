/**
 * Central theme configuration.
 * Edit here to change the entire app's appearance.
 * These tokens map to CSS custom properties in globals.css.
 */
export const theme = {
  colors: {
    primary: "hsl(240 5.9% 10%)",
    primaryForeground: "hsl(0 0% 98%)",
    secondary: "hsl(240 4.8% 95.9%)",
    secondaryForeground: "hsl(240 5.9% 10%)",
    background: "hsl(0 0% 100%)",
    surface: "hsl(0 0% 98%)",
    foreground: "hsl(240 10% 3.9%)",
    muted: "hsl(240 4.8% 95.9%)",
    mutedForeground: "hsl(240 3.8% 46.1%)",
    border: "hsl(240 5.9% 90%)",
    input: "hsl(240 5.9% 90%)",
    ring: "hsl(240 5.9% 10%)",
    destructive: "hsl(0 72.2% 50.6%)",
    destructiveForeground: "hsl(0 0% 98%)",
  },
  dark: {
    primary: "hsl(0 0% 98%)",
    primaryForeground: "hsl(240 5.9% 10%)",
    secondary: "hsl(240 3.7% 15.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
    background: "hsl(240 10% 3.9%)",
    surface: "hsl(240 3.7% 15.9%)",
    foreground: "hsl(0 0% 98%)",
    muted: "hsl(240 3.7% 15.9%)",
    mutedForeground: "hsl(240 5% 64.9%)",
    border: "hsl(240 3.7% 15.9%)",
    input: "hsl(240 3.7% 15.9%)",
    ring: "hsl(240 4.9% 83.9%)",
    destructive: "hsl(0 62.8% 30.6%)",
    destructiveForeground: "hsl(0 0% 98%)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  borderRadius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    full: "9999px",
  },
  fontFamily: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
} as const;

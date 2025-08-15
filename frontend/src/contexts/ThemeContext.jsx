import { createContext, useContext, useEffect, useState, useRef } from "react";
import chroma from "chroma-js";

const ThemeContext = createContext();

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://ihchav4fx1.execute-api.us-east-1.amazonaws.com';

const defaultThemeSettings = {
  primaryColor: "#0d6efd",
  secondaryColor: "#6c757d",
  backgroundColor: "#f8f9fa",
  textColor: "#212529",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const deriveThemeVariables = ({
  primaryColor,
  secondaryColor,
  backgroundColor,
  textColor,
  fontFamily,
}) => {
  const primaryHover = chroma(primaryColor).darken(0.5).hex();
  const linkColor = chroma(primaryColor).brighten(0.3).hex();
  const linkHover = chroma(primaryColor).darken(0.3).hex();

  const themeMode = chroma(backgroundColor).luminance() < 0.5 ? "dark" : "light";

  const cssVars = {
    "--bs-body-bg": backgroundColor,
    "--bs-body-color": textColor,
    "--bs-primary": primaryColor,
    "--bs-primary-rgb": primaryColor,
    "--bs-secondary": secondaryColor,
    "--bs-border-color": "#dee2e6",
    "--bs-link-color": linkColor,
    "--bs-link-hover-color": linkHover,
    "--bs-font-sans-serif": fontFamily,
    "--bs-btn-hover-color": "#fff",
    "--bs-btn-hover-bg": primaryHover,
    "--bs-btn-hover-border-color": primaryHover,
  };

  return { cssVars, themeMode };
};

export const ThemeProvider = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState(defaultThemeSettings);
  const debounceTimeout = useRef(null); // Store timeout across renders

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/getTheme`);
        const data = await res.json();
        setThemeSettings(
          (data.theme && Object.keys(data.theme).length > 0) ? data.theme : defaultThemeSettings
        );
      } catch (err) {
        console.error("Failed to fetch theme", err);
      }
    };
    fetchTheme();
  }, []);

  useEffect(() => {
    const { cssVars, themeMode } = deriveThemeVariables(themeSettings);

    Object.entries(cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    document.documentElement.setAttribute("data-bs-theme", themeMode);
  }, [themeSettings]);

  const updateTheme = async (newSettings) => {
    const updated = { ...themeSettings, ...newSettings };
    setThemeSettings(updated);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        await fetch(`${BASE_API_URL}/createTheme`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: updated }),
        });
      } catch (err) {
        console.error("Failed to save theme", err);
      }
    }, 800);
  };

  return (
    <ThemeContext.Provider value={{ themeSettings, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

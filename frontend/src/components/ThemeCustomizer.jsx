import { useTheme } from "../contexts/ThemeContext";

const colorInputs = [
  { name: "primaryColor", label: "Primary Accent" },
  { name: "secondaryColor", label: "Secondary Accent" },
  { name: "backgroundColor", label: "Background" },
  { name: "textColor", label: "Text" },
];

const fontOptions = [
  { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", label: "Segoe UI (Default)", preview: "Segoe UI" },
  { value: "'Fira Sans', sans-serif", label: "Fira Sans", preview: "Fira Sans" },
  { value: "'Quicksand', sans-serif", label: "Quicksand", preview: "Quicksand" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk", preview: "Space Grotesk" },
  { value: "'EB Garamond', serif", label: "EB Garamond", preview: "Garamond" },
  { value: "'Pacifico', cursive", label: "Pacifico (Handwriting)", preview: "Pacifico" },
];

const presetThemes = {
  light: {
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: fontOptions[3].value
  },
  dark: {
    primaryColor: "#ff9800",
    // secondaryColor: "#424242",
    secondaryColor: "#05d0cd",
    backgroundColor: "#1e1e1e",
    textColor: "#f5f5f5",
    fontFamily: fontOptions[1].value
  },
  peach: {
    primaryColor: "#ff7043",
    secondaryColor: "#8d6e63",
    backgroundColor: "#ffccbc",
    textColor: "#4e342e",
    fontFamily: fontOptions[4].value
  }
};

function ThemeCustomizer() {
  const { themeSettings, updateTheme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateTheme({ [name]: value });
  };

  const applyPreset = (presetName) => {
    updateTheme(presetThemes[presetName]);
  };

  return (
    <form className="card shadow border p-3" style={{ minWidth: "320px", maxWidth: "500px", border: "1px solid white" }}>
      <div className="card-body">
        <h5 className="card-title mb-4 text-primary fw-semibold">🎨 Theme Customizer</h5>

        {/* Preset Theme Buttons */}
        <div className="mb-4">
          <h6>Preset Themes</h6>
          <div className="d-flex gap-2 flex-wrap mt-3 justify-content-center">
            <button
              type="button"
              className="btn btn-light border"
              onClick={() => applyPreset("light")}
            >
              Light
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => applyPreset("dark")}
            >
              Dark
            </button>
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: presetThemes.peach.primaryColor,
                color: presetThemes.peach.textColor,
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                fontFamily: presetThemes.peach.fontFamily,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, transform 0.2s ease'
              }}
              onClick={() => applyPreset("peach")}
            >
              Peach
            </button>
          </div>
        </div>

        {/* Color Inputs */}
        <div className="mb-4">
          {colorInputs.map(({ name, label }) => (
            <div className="mb-3 d-flex align-items-center justify-content-between" key={name}>
              <label htmlFor={name} className="form-label mb-0 flex-grow-1">
                {label}
              </label>
              <input
                type="color"
                id={name}
                name={name}
                value={themeSettings[name]}
                onChange={handleChange}
                className="form-control form-control-color ms-3 p-0"
                title={label}
              />
            </div>
          ))}
        </div>

        {/* Font Selector */}
        <div className="mb-2">
          <label htmlFor="fontFamily" className="form-label mb-1">
            Font Family
          </label>
          <select
            id="fontFamily"
            name="fontFamily"
            className="form-select"
            value={themeSettings.fontFamily}
            onChange={handleChange}
          >
            {fontOptions.map(({ value, label, preview }) => (
              <option key={value} value={value} style={{ fontFamily: value }}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}

export default ThemeCustomizer;

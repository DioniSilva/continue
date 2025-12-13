// All vscode variables https://gist.github.com/estruyf/ba49203e1a7d6868e9320a4ea480c27a
// Examples for vscode https://github.com/githubocto/tailwind-vscode/blob/main/index.js

// The current default theme is dark with blue accents
export const THEME_COLORS = {
  background: {
    vars: [
      "--vscode-sideBar-background",
      "--vscode-editor-background",
      "--vscode-panel-background",
    ],
    default: "#0f1014", // coal
  },
  foreground: {
    vars: [
      "--vscode-sideBar-foreground",
      "--vscode-editor-foreground",
      "--vscode-panel-foreground",
    ],
    default: "#f4f5f7", // off white
  },
  "editor-background": {
    vars: ["--vscode-editor-background"],
    default: "#101217",
  },
  "editor-foreground": {
    vars: ["--vscode-editor-foreground"],
    default: "#f4f5f7",
  },
  "primary-background": {
    vars: ["--vscode-button-background"],
    default: "#ff4f00", // CWI orange
  },
  "primary-foreground": {
    vars: ["--vscode-button-foreground"],
    default: "#ffffff",
  },
  "primary-hover": {
    vars: ["--vscode-button-hoverBackground"],
    default: "#ff7a33",
  },
  "secondary-background": {
    vars: ["--vscode-button-secondaryBackground"],
    default: "#1b1c22",
  },
  "secondary-foreground": {
    vars: ["--vscode-button-secondaryForeground"],
    default: "#f0f1f5",
  },
  "secondary-hover": {
    vars: ["--vscode-button-secondaryHoverBackground"],
    default: "#23242b",
  },
  border: {
    vars: ["--vscode-sideBar-border", "--vscode-panel-border"],
    default: "#1f2027",
  },
  "border-focus": {
    vars: ["--vscode-focusBorder"],
    default: "#ff8e4c",
  },
  // Command styles are used for tip-tap editor
  "command-background": {
    vars: ["--vscode-commandCenter-background"],
    default: "#181a20",
  },
  "command-foreground": {
    vars: ["--vscode-commandCenter-foreground"],
    default: "#f5f5f5",
  },
  "command-border": {
    vars: ["--vscode-commandCenter-inactiveBorder"],
    default: "#2c2e36",
  },
  "command-border-focus": {
    vars: ["--vscode-commandCenter-activeBorder"],
    default: "#ff8e4c",
  },
  description: {
    vars: ["--vscode-descriptionForeground"],
    default: "#c7c9d1",
  },
  "description-muted": {
    vars: ["--vscode-list-deemphasizedForeground"],
    default: "#8e919e",
  },
  "input-background": {
    vars: ["--vscode-input-background"],
    default: "#1c1f27",
  },
  "input-foreground": {
    vars: ["--vscode-input-foreground"],
    default: "#f3f5f8",
  },
  "input-border": {
    vars: [
      "--vscode-input-border",
      "--vscode-commandCenter-inactiveBorder",
      "vscode-border",
    ],
    default: "#2d303b",
  },
  "input-placeholder": {
    vars: ["--vscode-input-placeholderForeground"],
    default: "#8f93a3",
  },
  "table-oddRow": {
    vars: ["--vscode-tree-tableOddRowsBackground"],
    default: "#1a1c22",
  },
  "badge-background": {
    vars: ["--vscode-badge-background"],
    default: "#ff4f00",
  },
  "badge-foreground": {
    vars: ["--vscode-badge-foreground"],
    default: "#ffffff",
  },
  info: {
    vars: [
      "--vscode-charts-blue",
      "--vscode-notebookStatusRunningIcon-foreground",
    ],
    default: "#00b3ff",
  },
  success: {
    vars: [
      "--vscode-notebookStatusSuccessIcon-foreground",
      "--vscode-testing-iconPassed",
      "--vscode-gitDecoration-addedResourceForeground",
      "--vscode-charts-green",
    ],
    default: "#4ad08d",
  },
  warning: {
    vars: [
      "--vscode-editorWarning-foreground",
      "--vscode-list-warningForeground",
    ],
    default: "#ffcf5c",
  },
  error: {
    vars: ["--vscode-editorError-foreground", "--vscode-list-errorForeground"],
    default: "#ff6b6b",
  },
  link: {
    vars: ["--vscode-textLink-foreground"],
    default: "#ff9764",
  },
  terminal: {
    vars: ["--vscode-terminal-ansiGreen"],
    default: "#41d0a2",
  },
  textCodeBlockBackground: {
    vars: ["--vscode-textCodeBlock-background"],
    default: "#14151b",
  },
  accent: {
    vars: ["--vscode-tab-activeBorderTop", "--vscode-focusBorder"],
    default: "#ff4f00",
  },
  "find-match": {
    vars: ["--vscode-editor-findMatchBackground"], // Can't get "var(--vscode-editor-findMatchBackground, rgba(237, 18, 146, 0.5))" to work
    default: "#ffb17a33",
  },
  "find-match-selected": {
    vars: ["--vscode-editor-findMatchHighlightBackground"],
    default: "#ff7a3333",
  },
  "list-hover": {
    // --vscode-tab-hoverBackground
    vars: ["--vscode-list-hoverBackground"],
    default: "#1f2128",
  },
  "list-active": {
    vars: ["--vscode-list-activeSelectionBackground"],
    default: "rgba(255, 79, 0, 0.18)",
  },
  "list-active-foreground": {
    vars: ["--vscode-list-activeSelectionForeground"],
    default: "#ffffff",
  },
};

// TODO: add fonts - GUI fonts in jetbrains differ from IDE:
// --vscode-editor-font-family;
// --vscode-font-family;
export const THEME_CSS_VARS = Object.values(THEME_COLORS)
  .map((value) => value.vars)
  .flat();

export const THEME_CSS_VAR_DEFAULTS = Object.entries(THEME_COLORS).reduce(
  (acc, [_, value]) => {
    value.vars.forEach((varName) => {
      acc[varName] = value.default;
    });
    return acc;
  },
  {} as Record<string, string>,
);

export const THEME_DEFAULTS = Object.entries(THEME_COLORS).reduce(
  (acc, [key, value]) => {
    acc[key] = value.default;
    return acc;
  },
  {} as Record<string, string>,
);

// Generates recursive CSS variable fallback for a given color name
// e.g. var(--vscode-button-background, var(--vscode-button-foreground, #ffffff))
export const getRecursiveVar = (vars: string[], defaultColor: string) => {
  return [...vars].reverse().reduce((curr, varName) => {
    return `var(${varName}, ${curr})`;
  }, defaultColor);
};

export const varWithFallback = (colorName: keyof typeof THEME_COLORS) => {
  const themeVals = THEME_COLORS[colorName];
  if (!themeVals) {
    throw new Error(`Invalid theme color name ${colorName}`);
  }
  return getRecursiveVar(themeVals.vars, themeVals.default);
};

export const setDocumentStylesFromTheme = (
  theme: Record<string, string | undefined | null>,
) => {
  // Check for extraneous theme items
  Object.entries(theme).forEach(([colorName, value]) => {
    const themeVals = THEME_COLORS[colorName as keyof typeof THEME_COLORS];
    if (!themeVals) {
      console.warn(
        `Receieved theme color ${colorName} which is not used by the theme`,
      );
      return;
    }
  });

  // Write theme values to document
  const missingColors: string[] = [];
  Object.entries(THEME_COLORS).forEach(([colorName, settings]) => {
    let colorVal = settings.default;
    const newColor = theme[colorName];
    if (newColor) {
      colorVal = newColor;
      // Remove alpha channel from all hex colors (seems to cause bad colors)
      if (newColor.startsWith("#") && newColor.length > 7) {
        colorVal = colorVal.slice(0, 7);
      }
    } else {
      missingColors.push(colorName);
      // console.warn(
      //   `Missing theme color: ${colorName}. Falling back to default ${colorVal}`,
      // );
    }

    localStorage.setItem(colorName, colorVal);
    for (const cssVar of settings.vars) {
      document.body.style.setProperty(cssVar, colorVal);
      document.documentElement.style.setProperty(cssVar, colorVal);
    }
  });

  return missingColors;
};

export const setDocumentStylesFromLocalStorage = (checkCache: boolean) => {
  for (const [colorName, themeVals] of Object.entries(THEME_COLORS)) {
    for (const cssVar of themeVals.vars) {
      // Get cached values (for non-vscode IDEs)
      if (checkCache) {
        const cached = localStorage.getItem(colorName);
        if (cached) {
          document.body.style.setProperty(cssVar, cached);
        }
      }
    }
  }
};

export const clearThemeLocalCache = () => {
  for (const colorName of Object.keys(THEME_COLORS)) {
    localStorage.removeItem(colorName);
  }
};

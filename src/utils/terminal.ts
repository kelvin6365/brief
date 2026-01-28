/**
 * Terminal utilities
 * Detect terminal capabilities and provide appropriate characters
 */

/**
 * Detect if terminal supports Unicode
 */
export function supportsUnicode(): boolean {
  const env = process.env;

  // If TERM explicitly says no unicode (very old terminals)
  if (env.TERM === "linux" || env.TERM === "dumb") {
    return false;
  }

  // Modern terminal programs (always support Unicode)
  const modernTerminals = [
    "iTerm.app",
    "Apple_Terminal",
    "vscode",
    "WarpTerminal",
    "Hyper",
    "Alacritty",
    "kitty",
  ];

  if (
    env.TERM_PROGRAM &&
    modernTerminals.some((t) => env.TERM_PROGRAM?.includes(t))
  ) {
    return true;
  }

  // Windows Terminal
  if (env.WT_SESSION) {
    return true;
  }

  // Check locale for UTF-8 (strong indicator)
  const locale = env.LC_ALL || env.LC_CTYPE || env.LANG || "";
  if (
    locale.toLowerCase().includes("utf-8") ||
    locale.toLowerCase().includes("utf8")
  ) {
    return true;
  }

  // Modern TERM values (xterm-256color, screen-256color, etc.)
  const term = env.TERM || "";
  if (
    term.includes("256color") ||
    term.includes("xterm") ||
    term.includes("screen")
  ) {
    return true;
  }

  // macOS and modern Unix systems default to UTF-8
  if (process.platform === "darwin" || process.platform === "linux") {
    return true;
  }

  // Only on Windows CMD/old terminals, default to false
  if (process.platform === "win32" && !env.WT_SESSION) {
    return false;
  }

  // Default to true for modern systems
  return true;
}

/**
 * Get appropriate characters based on terminal capability
 */
export function getTerminalChars() {
  const unicode = supportsUnicode();

  return {
    // Selection indicators
    cursor: unicode ? "❯" : ">",
    checkboxChecked: unicode ? "✓" : "x",
    checkboxUnchecked: " ",
    radioSelected: unicode ? "●" : "*",
    radioUnselected: unicode ? "○" : " ",

    // Step indicators
    stepCompleted: unicode ? "●" : "[*]",
    stepCurrent: unicode ? "○" : "[>]",
    stepPending: unicode ? "○" : "[ ]",
    stepSeparator: unicode ? " — " : " - ",

    // Symbols
    arrow: unicode ? "→" : "->",
    check: unicode ? "✓" : "[OK]",
    cross: unicode ? "✗" : "[X]",
    info: unicode ? "ℹ" : "[i]",
    warning: unicode ? "⚠" : "[!]",
    bullet: unicode ? "•" : "*",

    // Box drawing
    boxTopLeft: unicode ? "╭" : "+",
    boxTopRight: unicode ? "╮" : "+",
    boxBottomLeft: unicode ? "╰" : "+",
    boxBottomRight: unicode ? "╯" : "+",
    boxHorizontal: unicode ? "─" : "-",
    boxVertical: unicode ? "│" : "|",

    // Instructions
    arrowUp: unicode ? "↑" : "up",
    arrowDown: unicode ? "↓" : "down",
    arrowLeft: unicode ? "←" : "left",
    arrowRight: unicode ? "→" : "right",
  };
}

/**
 * Format instruction text based on terminal capability
 */
export function formatInstructions(instructions: string[]): string {
  const unicode = supportsUnicode();
  const separator = unicode ? " • " : " | ";

  return instructions.join(separator);
}

/**
 * Get terminal info for debugging
 */
export function getTerminalInfo() {
  return {
    isTTY: process.stdout.isTTY,
    supportsUnicode: supportsUnicode(),
    term: process.env.TERM,
    termProgram: process.env.TERM_PROGRAM,
    locale: process.env.LANG || process.env.LC_ALL || process.env.LC_CTYPE,
    platform: process.platform,
  };
}

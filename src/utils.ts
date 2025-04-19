/**
 * Utility functions for HTML to MJML conversion
 */
import { WarningContext } from "./types";

/**
 * Convert an object of attributes to a string of HTML attributes
 */
export function attributesToString(
  attributes: Record<string, string | undefined>
): string {
  if (!attributes || typeof attributes !== "object") return "";

  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([name, value]) => `${name}="${escapeAttributeValue(value as string)}"`
    )
    .join(" ");
}

/**
 * Escape special characters in HTML attribute values
 */
export function escapeAttributeValue(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape HTML content
 */
export function escapeHtml(content: string): string {
  return String(content)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Determine if an element needs to be wrapped in an mj-column
 */
export function needsMjColumnWrapper(tagName: string): boolean {
  // Elements that should be direct children of mj-column
  const columnChildren = [
    "mj-text",
    "mj-image",
    "mj-button",
    "mj-divider",
    "mj-spacer",
    "mj-table",
    "mj-social",
    "mj-navbar",
  ];

  return columnChildren.includes(tagName);
}

/**
 * Determine if an element needs to be wrapped in an mj-section
 */
export function needsMjSectionWrapper(tagName: string): boolean {
  return tagName === "mj-column" || tagName === "mj-group";
}

/**
 * Check if a tag is a MJML component
 */
export function isMjmlComponent(tagName: string): boolean {
  return tagName.startsWith("mj-");
}

/**
 * Generate a warning message for console output
 */
export function generateWarning(
  message: string,
  context: WarningContext = {}
): string {
  let warning = `[html-to-mjml] WARNING: ${message}`;

  if (context.element) {
    warning += ` (Element: ${context.element})`;
  }

  if (context.line) {
    warning += ` at line ${context.line}`;
  }

  return warning;
}

/**
 * Detect if code is running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Create a DOM parser for browser or server environment
 */
export function createDOMParser() {
  if (isBrowser()) {
    // Browser environment
    return new DOMParser();
  } else {
    // Node.js environment - dynamic import to avoid bundling issues
    try {
      // Use dynamic require to avoid bundling JSDOM in browser builds
      const JSDOM = eval("require")("jsdom").JSDOM;
      return {
        parseFromString: (markup: string, type: string) => {
          const dom = new JSDOM(markup);
          return dom.window.document;
        },
      };
    } catch (e) {
      throw new Error(
        "JSDOM is required for server-side rendering. Please install it: npm install jsdom"
      );
    }
  }
}

/**
 * Serialize a DOM node to string
 */
export function serializeNode(node: Node): string {
  if (isBrowser()) {
    // Browser environment
    const serializer = new XMLSerializer();
    return serializer.serializeToString(node);
  } else {
    // Node.js environment
    // Return the outerHTML if it exists, otherwise use JSDOM's serializer
    if ("outerHTML" in node) {
      return (node as Element).outerHTML;
    } else {
      const { JSDOM } = require("jsdom");
      return new JSDOM().window.XMLSerializer().serializeToString(node);
    }
  }
}

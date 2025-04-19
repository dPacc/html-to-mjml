/**
 * Element mappings from HTML to MJML
 */
import { ElementMapping } from "./types";

// Store custom element mappings
const customElementMappings: Record<string, ElementMapping> = {};

/**
 * Default mapping of HTML elements to MJML components
 */
export const defaultElementMappings: Record<string, ElementMapping> = {
  // Structure elements
  html: {
    mjmlTag: "mjml",
  },
  head: {
    mjmlTag: "mj-head",
  },
  title: {
    mjmlTag: "mj-title",
  },
  body: {
    mjmlTag: "mj-body",
  },

  // Content elements
  div: {
    mjmlTag: "mj-section",
    attributeTransform: (attrs) => {
      // Check if this div has specific characteristics that would make it a column instead
      if (
        attrs.class &&
        (attrs.class.includes("column") || attrs.class.includes("col"))
      ) {
        return { mjmlTag: "mj-column", attributes: attrs };
      }
      return attrs;
    },
  },
  p: {
    mjmlTag: "mj-text",
  },
  h1: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "font-size": "28px",
      "font-weight": "bold",
    }),
  },
  h2: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "font-size": "24px",
      "font-weight": "bold",
    }),
  },
  h3: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "font-size": "20px",
      "font-weight": "bold",
    }),
  },
  h4: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "font-size": "18px",
      "font-weight": "bold",
    }),
  },
  h5: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "font-size": "16px",
      "font-weight": "bold",
    }),
  },
  h6: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "font-size": "14px",
      "font-weight": "bold",
    }),
  },
  span: {
    mjmlTag: "mj-text",
    inlineElement: true,
  },
  a: {
    mjmlTag: "mj-button",
    attributeTransform: (attrs) => {
      // Check if this looks like a navigation link or a button
      const isButton =
        attrs.class &&
        (attrs.class.includes("button") ||
          attrs.class.includes("btn") ||
          (attrs.style &&
            (attrs.style.includes("background") ||
              attrs.style.includes("padding"))));

      if (isButton) {
        return attrs;
      } else {
        return {
          mjmlTag: "mj-text",
          attributes: { ...attrs, href: attrs.href },
        };
      }
    },
  },
  img: {
    mjmlTag: "mj-image",
    attributeTransform: (attrs) => {
      const fluid = attrs.responsive === "true" ? "true" : undefined;
      return {
        src: attrs.src,
        alt: attrs.alt,
        width: attrs.width,
        height: attrs.height,
        ...(fluid ? { fluid } : {}),
      };
    },
    selfClosing: true,
  },
  table: {
    mjmlTag: "mj-table",
    special: true, // Tables need special handling
  },
  button: {
    mjmlTag: "mj-button",
  },
  hr: {
    mjmlTag: "mj-divider",
    selfClosing: true,
  },
  br: {
    mjmlTag: "mj-spacer",
    attributeTransform: (attrs) => ({ height: "20px", ...attrs }),
    selfClosing: true,
  },
  ul: {
    mjmlTag: "mj-text",
    special: true, // Lists need special handling
  },
  ol: {
    mjmlTag: "mj-text",
    special: true, // Lists need special handling
  },
  li: {
    mjmlTag: "mj-text",
    inlineElement: true,
    special: true, // List items need special handling
  },

  // Form elements (these will be transformed into visually similar components)
  form: {
    mjmlTag: "mj-section",
    warning:
      "Forms are not fully supported in email. Converting to visual representation only.",
  },
  input: {
    mjmlTag: "mj-text",
    attributeTransform: (attrs) => ({
      ...attrs,
      "css-class": "form-input-simulation",
    }),
    warning:
      "Input elements are not supported in email. Converting to visual representation only.",
  },

  // Default fallback for unknown elements
  DEFAULT: {
    mjmlTag: "mj-text",
  },
};

/**
 * Get mapping for an HTML element
 */
export function getElementMapping(elementName: string): ElementMapping {
  // Check first in custom mappings, then in default mappings, then fallback to DEFAULT
  return (
    customElementMappings[elementName] ||
    defaultElementMappings[elementName] ||
    defaultElementMappings.DEFAULT
  );
}

/**
 * Register a custom element mapping
 */
export function registerCustomElementMapping(
  elementName: string,
  mapping: ElementMapping
): boolean {
  if (!elementName || typeof elementName !== "string") {
    throw new Error("Element name must be a string");
  }

  if (!mapping || typeof mapping !== "object" || !mapping.mjmlTag) {
    throw new Error(
      "Mapping must be an object with at least a mjmlTag property"
    );
  }

  customElementMappings[elementName] = {
    mjmlTag: mapping.mjmlTag,
    attributeTransform: mapping.attributeTransform || ((attrs) => attrs),
    childrenContainer: mapping.childrenContainer || null,
    selfClosing: !!mapping.selfClosing,
    special: !!mapping.special,
    inlineElement: !!mapping.inlineElement,
    warning: mapping.warning,
  };

  return true;
}

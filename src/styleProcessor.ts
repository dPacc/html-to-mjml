/**
 * Style processor for converting CSS styles to MJML attributes
 */
import * as css from "css";
import { StyleMap } from "./types";

/**
 * Map of CSS properties to MJML attributes
 */
export const CSS_TO_MJML_ATTRIBUTES: Record<string, string> = {
  // Text styling
  color: "color",
  "font-family": "font-family",
  "font-size": "font-size",
  "font-style": "font-style",
  "font-weight": "font-weight",
  "line-height": "line-height",
  "letter-spacing": "letter-spacing",
  "text-align": "align",
  "text-decoration": "text-decoration",
  "text-transform": "text-transform",

  // Spacing
  padding: "padding",
  "padding-top": "padding-top",
  "padding-right": "padding-right",
  "padding-bottom": "padding-bottom",
  "padding-left": "padding-left",
  margin: "margin",
  "margin-top": "margin-top",
  "margin-right": "margin-right",
  "margin-bottom": "margin-bottom",
  "margin-left": "margin-left",

  // Layout
  width: "width",
  height: "height",
  "max-width": "max-width",
  "background-color": "background-color",
  background: "background",
  border: "border",
  "border-radius": "border-radius",
  "border-top": "border-top",
  "border-right": "border-right",
  "border-bottom": "border-bottom",
  "border-left": "border-left",

  // Container properties for sections
  direction: "direction",
  "vertical-align": "vertical-align",
};

/**
 * Process inline CSS style attribute and convert to MJML attributes
 */
export function processInlineStyles(styleAttr: string): Record<string, string> {
  if (!styleAttr) return {};

  const attributes: Record<string, string> = {};
  const styles = styleAttr.split(";").filter((style) => style.trim() !== "");

  for (const style of styles) {
    const [property, value] = style.split(":").map((part) => part.trim());
    if (!property || !value) continue;

    const mjmlAttribute = CSS_TO_MJML_ATTRIBUTES[property];

    if (mjmlAttribute) {
      attributes[mjmlAttribute] = value;
    }
  }

  return attributes;
}

/**
 * Process a CSS style block and extract class-based styles
 */
export function processStyleBlock(cssText: string): StyleMap {
  if (!cssText) return {};

  const styleMap: StyleMap = {};

  try {
    const parsedCss = css.parse(cssText);

    if (!parsedCss.stylesheet) return {};

    // Process each rule in the CSS
    for (const rule of parsedCss.stylesheet.rules) {
      if (rule.type !== "rule") continue;

      const ruleObj = rule as css.Rule;

      // Extract attributes from declarations
      const attributes: Record<string, string> = {};
      if (ruleObj.declarations) {
        for (const declaration of ruleObj.declarations) {
          if (declaration.type !== "declaration") continue;

          const declObj = declaration as css.Declaration;
          if (!declObj.property || !declObj.value) continue;

          const mjmlAttribute = CSS_TO_MJML_ATTRIBUTES[declObj.property];
          if (mjmlAttribute) {
            attributes[mjmlAttribute] = declObj.value;
          }
        }
      }

      // Map to selectors
      if (ruleObj.selectors) {
        for (const selector of ruleObj.selectors) {
          // Only handle class selectors for now
          if (selector.startsWith(".")) {
            const className = selector.substring(1);
            styleMap[className] = attributes;
          }
        }
      }
    }
  } catch (error) {
    console.warn("Error parsing CSS:", error);
  }

  return styleMap;
}

/**
 * Apply class-based styles to MJML attributes
 */
export function applyClassStyles(
  attributes: Record<string, string>,
  className: string,
  styleMap: StyleMap
): Record<string, string> {
  if (!className || !styleMap) return attributes;

  const classNames = className
    .split(" ")
    .map((cls) => cls.trim())
    .filter(Boolean);
  let updatedAttributes = { ...attributes };

  for (const cls of classNames) {
    if (styleMap[cls]) {
      updatedAttributes = { ...updatedAttributes, ...styleMap[cls] };
    }
  }

  return updatedAttributes;
}

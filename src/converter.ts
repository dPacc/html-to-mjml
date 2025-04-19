/**
 * Main converter module for transforming HTML to MJML
 */
import { ConversionOptions, MJMLParseResult, StyleMap } from "./types";
import { getElementMapping } from "./elementMappings";
import {
  processInlineStyles,
  processStyleBlock,
  applyClassStyles,
} from "./styleProcessor";
import {
  attributesToString,
  needsMjColumnWrapper,
  needsMjSectionWrapper,
  isMjmlComponent,
  generateWarning,
  createDOMParser,
  isBrowser,
} from "./utils";

/**
 * Default conversion options
 */
const DEFAULT_OPTIONS: ConversionOptions = {
  validateOutput: true,
  preserveClassNames: false,
  inlineStyles: true,
  customElementMappings: {},
  wrapContent: true,
  showWarnings: true,
};

// Dynamically import MJML to avoid bundling issues in browser
function getMJML() {
  if (isBrowser()) {
    if (typeof window.mjml === "undefined") {
      console.warn(
        "MJML is not found in the browser environment. Make sure to include mjml-browser in your page."
      );
      return null;
    }
    return window.mjml;
  } else {
    // Use dynamic require to avoid bundling MJML in browser builds
    try {
      return eval("require")("mjml");
    } catch (e) {
      console.warn("MJML is not installed. Please run: npm install mjml");
      return null;
    }
  }
}

/**
 * Convert HTML string to MJML string
 */
export function convertHtmlToMjml(
  htmlString: string,
  options: ConversionOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];

  // Parse the HTML
  const parser = createDOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Process style blocks if present
  let styleMap: StyleMap = {};
  if (mergedOptions.inlineStyles) {
    const styleElements = doc.querySelectorAll("style");
    styleElements.forEach((styleEl: Element) => {
      const cssText = styleEl.textContent || "";
      const blockStyles = processStyleBlock(cssText);
      styleMap = { ...styleMap, ...blockStyles };
    });
  }

  // If there's no html/body structure, wrap everything in a default structure
  if (doc.querySelector("html") === null && mergedOptions.wrapContent) {
    const bodyEl = doc.querySelector("body");
    if (bodyEl) {
      // If body exists but no html, wrap body in html
      const htmlEl = doc.createElement("html");
      const bodyParent = bodyEl.parentNode;
      if (bodyParent) {
        bodyParent.removeChild(bodyEl);
        htmlEl.appendChild(bodyEl);
        doc.appendChild(htmlEl);
      }
    } else {
      // If no body exists, create one
      const htmlEl = doc.createElement("html");
      const bodyEl = doc.createElement("body");

      // Move all content to the body
      while (doc.body.firstChild) {
        bodyEl.appendChild(doc.body.firstChild);
      }

      htmlEl.appendChild(bodyEl);
      doc.appendChild(htmlEl);
    }
  }

  // Start the conversion process
  let mjmlOutput: string;

  // If there's already an mjml tag (partial conversion), use it as is
  if (doc.querySelector("mjml")) {
    // Use the document as is
    const serializer = isBrowser() ? new XMLSerializer() : null;
    mjmlOutput = isBrowser()
      ? serializer!.serializeToString(doc)
      : doc.documentElement.outerHTML;
  } else {
    // Convert the HTML structure to MJML
    const html = doc.querySelector("html");
    const convertedContent = html
      ? processNode(html, styleMap, mergedOptions, warnings)
      : processNode(
          doc.body || doc.documentElement,
          styleMap,
          mergedOptions,
          warnings
        );

    mjmlOutput = convertedContent.trim();
  }

  // Validate and minify the MJML if requested
  if (mergedOptions.validateOutput) {
    const mjml = getMJML();
    if (mjml) {
      try {
        const result = mjml(mjmlOutput, {
          validationLevel: "soft",
        }) as MJMLParseResult;

        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error) => {
            warnings.push(
              generateWarning(`MJML validation error: ${error.message}`, {
                line: error.line,
              })
            );
          });
        }

        // Return the rendered HTML if validation passed
        return result.html;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        warnings.push(
          generateWarning(`MJML processing error: ${errorMessage}`)
        );
        // Fall back to returning the raw MJML
        return mjmlOutput;
      }
    } else {
      warnings.push(
        generateWarning("MJML validation skipped: MJML library not available")
      );
      return mjmlOutput;
    }
  }

  // Output any warnings
  if (mergedOptions.showWarnings && warnings.length > 0) {
    warnings.forEach((warning) => console.warn(warning));
  }

  return mjmlOutput;
}

/**
 * Process an HTML node and convert it to MJML
 */
function processNode(
  node: Node,
  styleMap: StyleMap,
  options: ConversionOptions,
  warnings: string[]
): string {
  // Handle different node types
  if (!node) return "";

  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  // Comment node
  if (node.nodeType === Node.COMMENT_NODE) {
    return `<!-- ${(node as Comment).data} -->`;
  }

  // Only process element nodes
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const parentElement = element.parentNode as Element;
  const parentTagName =
    parentElement && parentElement.nodeType === Node.ELEMENT_NODE
      ? parentElement.tagName.toLowerCase()
      : undefined;

  // If the node is already an MJML component, keep it as is
  if (isMjmlComponent(tagName)) {
    const attributes: Record<string, string> = {};

    // Extract attributes
    Array.from(element.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });

    const attrString = attributesToString(attributes);

    // Process children
    let children = "";
    Array.from(element.childNodes).forEach((child) => {
      children += processNode(child, styleMap, options, warnings);
    });

    if (children.trim()) {
      return `<${tagName} ${attrString}>${children}</${tagName}>`;
    } else {
      return `<${tagName} ${attrString}/>`;
    }
  }

  // Get the mapping for this HTML element
  const mapping = getElementMapping(tagName);

  if (mapping.warning) {
    warnings.push(generateWarning(mapping.warning, { element: tagName }));
  }

  // Extract and process attributes
  const htmlAttributes: Record<string, string> = {};
  Array.from(element.attributes).forEach((attr) => {
    htmlAttributes[attr.name] = attr.value;
  });

  let mjmlAttributes: Record<string, string> = {};

  // Process inline styles if enabled
  if (options.inlineStyles && htmlAttributes.style) {
    const inlineStyleAttributes = processInlineStyles(htmlAttributes.style);
    mjmlAttributes = { ...mjmlAttributes, ...inlineStyleAttributes };
  }

  // Process class-based styles if enabled
  if (options.inlineStyles && htmlAttributes.class) {
    mjmlAttributes = applyClassStyles(
      mjmlAttributes,
      htmlAttributes.class,
      styleMap
    );
  }

  // Preserve class names if enabled
  if (options.preserveClassNames && htmlAttributes.class) {
    mjmlAttributes["css-class"] = htmlAttributes.class;
  }

  // Let the mapping transform the attributes
  let mjmlTag = mapping.mjmlTag;
  let transformedAttrs: Record<string, string>;

  if (mapping.attributeTransform) {
    const result = mapping.attributeTransform(htmlAttributes);
    if ("mjmlTag" in result && "attributes" in result) {
      mjmlTag = result.mjmlTag;
      transformedAttrs = result.attributes as Record<string, string>;
    } else {
      transformedAttrs = result;
    }

    mjmlAttributes = { ...mjmlAttributes, ...transformedAttrs };
  } else {
    mjmlAttributes = { ...mjmlAttributes, ...htmlAttributes };
  }

  // Process children
  let children = "";
  Array.from(element.childNodes).forEach((child) => {
    children += processNode(child, styleMap, options, warnings);
  });

  // Handle special cases
  if (mapping.special) {
    return handleSpecialElements(
      tagName,
      mjmlTag,
      mjmlAttributes,
      children,
      options,
      parentTagName
    );
  }

  // Create the MJML tag with attributes
  const attributesString = attributesToString(mjmlAttributes);

  // Handle self-closing tags
  if (mapping.selfClosing || !children.trim()) {
    return `<${mjmlTag} ${attributesString}/>`;
  }

  // Handle standard tags with children
  let output = `<${mjmlTag} ${attributesString}>${children}</${mjmlTag}>`;

  // Handle wrapping in mj-column or mj-section if needed
  if (needsMjColumnWrapper(mjmlTag) && !node.parentNode) {
    output = `<mj-column>${output}</mj-column>`;
  }

  if (needsMjSectionWrapper(mjmlTag) && !node.parentNode) {
    output = `<mj-section>${output}</mj-section>`;
  }

  return output;
}

/**
 * Handle special HTML elements that need custom processing
 */
function handleSpecialElements(
  htmlTag: string,
  mjmlTag: string,
  attributes: Record<string, string>,
  children: string,
  options: ConversionOptions,
  parentTag?: string
): string {
  const attributesString = attributesToString(attributes);

  switch (htmlTag) {
    case "table":
      // Convert tables as-is within mj-table
      return `<${mjmlTag} ${attributesString}>${children}</${mjmlTag}>`;

    case "ul":
      // Handle unordered lists
      return `<${mjmlTag} ${attributesString}>${children}</${mjmlTag}>`;

    case "ol":
      // Handle ordered lists
      return `<${mjmlTag} ${attributesString}>${children}</${mjmlTag}>`;

    case "li":
      // Handle list items
      const bullet = parentTag === "ul" ? "• " : ""; // Add bullet for ul items
      return `<${mjmlTag} ${attributesString}>${bullet}${children}</${mjmlTag}>`;

    default:
      // Default handling
      return `<${mjmlTag} ${attributesString}>${children}</${mjmlTag}>`;
  }
}

// Add type for window to make TypeScript happy
declare global {
  interface Window {
    mjml?: any;
  }
}

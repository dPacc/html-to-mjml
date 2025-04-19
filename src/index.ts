/**
 * html-to-mjml
 * A universal library to convert HTML to MJML for responsive emails
 */

import { convertHtmlToMjml } from "./converter";
import { registerCustomElementMapping } from "./elementMappings";
import { ConversionOptions, ElementMapping } from "./types";

/**
 * Converts HTML string to MJML string
 *
 * @param htmlString - The HTML string to convert
 * @param options - Conversion options
 * @returns The converted MJML string
 */
function htmlToMjml(
  htmlString: string,
  options: ConversionOptions = {}
): string {
  return convertHtmlToMjml(htmlString, options);
}

// Default export
export default {
  htmlToMjml,
  registerCustomElementMapping,
};

// Named exports
export {
  htmlToMjml,
  registerCustomElementMapping,
  ConversionOptions,
  ElementMapping,
};

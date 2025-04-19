/**
 * Types for the HTML to MJML converter
 */

export interface ConversionOptions {
  /** Whether to validate the output MJML (default: true) */
  validateOutput?: boolean;
  /** Whether to preserve class names in the output (default: false) */
  preserveClassNames?: boolean;
  /** Whether to process inline styles (default: true) */
  inlineStyles?: boolean;
  /** Custom element mappings */
  customElementMappings?: Record<string, ElementMapping>;
  /** Whether to wrap content in a default structure (default: true) */
  wrapContent?: boolean;
  /** Whether to show warnings in the console (default: true) */
  showWarnings?: boolean;
}

export interface ElementMapping {
  /** The MJML tag to use */
  mjmlTag: string;
  /** Function to transform attributes */
  attributeTransform?: (
    attrs: Record<string, string>
  ) =>
    | Record<string, string>
    | { mjmlTag: string; attributes: Record<string, string> };
  /** Container for children */
  childrenContainer?: string | null;
  /** Whether the element is self-closing */
  selfClosing?: boolean;
  /** Whether the element needs special handling */
  special?: boolean;
  /** Whether the element is an inline element */
  inlineElement?: boolean;
  /** Warning message for this element */
  warning?: string;
}

export interface StyleMap {
  [className: string]: Record<string, string>;
}

export interface ProcessedNode {
  tag: string;
  attributes: Record<string, string>;
  content: string;
  selfClosing: boolean;
}

export interface WarningContext {
  element?: string;
  line?: number;
  [key: string]: any;
}

export interface MJMLParseResult {
  html: string;
  errors: Array<{
    line: number;
    message: string;
    tagName: string;
    formattedMessage: string;
  }>;
}

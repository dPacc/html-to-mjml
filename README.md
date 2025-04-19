# HTML to MJML Converter

A universal JavaScript library for converting HTML to MJML (Mail Jet Markup Language) to create responsive emails that work across email clients. Works in both **Node.js** and **browser environments** including React applications.

## Features

- Convert standard HTML to responsive MJML
- Process inline styles and CSS stylesheets
- Intelligent mapping of HTML elements to appropriate MJML components
- Support for custom element mappings
- Validation and minification of MJML output
- **Universal compatibility** - works in Node.js and browsers
- TypeScript support with full type definitions
- React-friendly with no dependencies on Node.js specific libraries

## Installation

```bash
npm install html-to-mjml mjml-browser
```

## Quick Start

### Node.js Usage

```javascript
const { htmlToMjml } = require('html-to-mjml');
const mjml = require('mjml');

// HTML content to convert
const htmlContent = `
  <div>
    <h1>Welcome to our newsletter!</h1>
    <p>This is an example of <strong>HTML to MJML</strong> conversion.</p>
    <a href="https://example.com" style="background-color: blue; color: white; padding: 10px;">Click me</a>
  </div>
`;

// Convert HTML to MJML
const mjmlOutput = htmlToMjml(htmlContent);

// Generate final HTML from MJML
const finalHtml = mjml(mjmlOutput).html;

console.log(finalHtml);
```

### Browser/React Usage

First, include the MJML browser library in your HTML:

```html
<script src="https://unpkg.com/mjml-browser@4.14.1/lib/index.js"></script>
```

Then use the library in your JavaScript/React code:

```jsx
import React, { useState } from 'react';
import { htmlToMjml } from 'html-to-mjml';

function EmailConverter() {
  const [htmlInput, setHtmlInput] = useState('<div><h1>Hello World</h1></div>');
  const [mjmlOutput, setMjmlOutput] = useState('');
  
  const handleConvert = () => {
    try {
      // Convert HTML to MJML
      const mjml = htmlToMjml(htmlInput, { validateOutput: false });
      setMjmlOutput(mjml);
      
      // If you want the final HTML
      const finalHtml = window.mjml(mjml).html;
      // Use finalHtml as needed
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };
  
  return (
    <div>
      <textarea 
        value={htmlInput}
        onChange={(e) => setHtmlInput(e.target.value)}
      />
      <button onClick={handleConvert}>Convert</button>
      <textarea value={mjmlOutput} readOnly />
    </div>
  );
}
```

## Options

The `htmlToMjml` function accepts the following options:

```javascript
const options = {
  // Whether to validate the output MJML (defaults to true)
  validateOutput: true,
  
  // Whether to preserve HTML class names in the output (defaults to false)
  preserveClassNames: false,
  
  // Whether to process inline styles and stylesheets (defaults to true)
  inlineStyles: true,
  
  // Custom element mappings (see Custom Mappings section)
  customElementMappings: {},
  
  // Whether to automatically wrap content in basic structure (defaults to true)
  wrapContent: true,
  
  // Whether to show warnings in the console (defaults to true)
  showWarnings: true
};

const mjmlOutput = htmlToMjml(htmlContent, options);
```

## Element Mappings

The library maps HTML elements to MJML components using intelligent rules:

| HTML Element     | MJML Component           | Notes                                               |
| ---------------- | ------------------------ | --------------------------------------------------- |
| `html`           | `mjml`                   | Root element                                        |
| `head`           | `mj-head`                | Head section                                        |
| `title`          | `mj-title`               | Email title                                         |
| `body`           | `mj-body`                | Body section                                        |
| `div`            | `mj-section`             | May become `mj-column` based on context             |
| `p`              | `mj-text`                | Paragraph text                                      |
| `h1`-`h6`        | `mj-text`                | With appropriate font sizing                        |
| `span`           | `mj-text`                | Inline text                                         |
| `a`              | `mj-button` or `mj-text` | Automatically determines if link should be a button |
| `img`            | `mj-image`               | Image handling                                      |
| `table`          | `mj-table`               | Table support                                       |
| `button`         | `mj-button`              | Button element                                      |
| `hr`             | `mj-divider`             | Horizontal rule                                     |
| `br`             | `mj-spacer`              | Line break                                          |
| `ul`, `ol`, `li` | `mj-text`                | List elements                                       |

## Custom Element Mappings

You can register custom element mappings to control how specific HTML elements are converted:

```javascript
import { htmlToMjml, registerCustomElementMapping } from 'html-to-mjml';

// Register a custom mapping for a product card element
registerCustomElementMapping('article', {
  mjmlTag: 'mj-section',
  attributeTransform: (attrs) => {
    // Check for specific class
    if (attrs.class && attrs.class.includes('product-card')) {
      return {
        'background-color': '#ffffff',
        'border-radius': '8px',
        'padding': '10px'
      };
    }
    return attrs;
  },
  selfClosing: false
});

// Now any <article class="product-card"> will be converted to a styled mj-section
```

## Style Processing

The library intelligently processes both inline styles and CSS stylesheets:

```html
<style>
  .header { background-color: #f8f9fa; padding: 20px; }
  .content { color: #333; }
</style>

<div class="header">
  <h1>Hello World</h1>
</div>
<div class="content" style="font-size: 16px;">
  This content has both class-based and inline styles.
</div>
```

The converter will apply both the class-based styles and inline styles to the resulting MJML components.

## Integration with React Applications

This library was specifically designed to work well in React applications. Here's how to integrate it:

1. Install the required packages:

```bash
npm install html-to-mjml mjml-browser
```

2. Include the MJML browser library:

Either add it to your HTML:

```html
<script src="https://unpkg.com/mjml-browser@4.14.1/lib/index.js"></script>
```

Or dynamically import it in your component:

```jsx
useEffect(() => {
  const loadMjml = async () => {
    if (!window.mjml) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/mjml-browser@4.14.1/lib/index.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        // MJML is loaded, you can now use it
      };
    }
  };
  
  loadMjml();
}, []);
```

3. Create your converter component (see examples folder for a complete implementation)

## Examples

See the `examples/` directory for more comprehensive examples:

- `examples/node/simple.js`: Basic Node.js conversion example
- `examples/react-app`: Complete React application with HTML to MJML conversion
- `examples/react-example/HtmlToMjmlConverter.jsx`: Standalone React component

## Building from Source

```bash
# Clone the repository
git clone https://github.com/username/html-to-mjml.git
cd html-to-mjml

# Install dependencies
npm install

# Build the library
npm run build

# The library will be built in the dist/ directory:
# - dist/esm/: ES modules
# - dist/cjs/: CommonJS modules
# - dist/browser/: Browser UMD bundle
# - dist/types/: TypeScript definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MJML](https://mjml.io/) for their amazing email framework
- [MJML Browser](https://github.com/mjmlio/mjml-browser) for the browser compatibility

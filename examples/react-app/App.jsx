import React, { useState } from "react";
import { htmlToMjml } from "html-to-mjml";
import "./App.css";

// Note: Make sure to include the MJML browser library in your HTML
// <script src="https://unpkg.com/mjml-browser@4.14.1/lib/index.js"></script>

function App() {
  const [htmlContent, setHtmlContent] = useState(`
<div style="font-family: Arial, sans-serif;">
  <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
    <h1 style="color: #333;">Welcome to our Newsletter</h1>
  </div>
  
  <div style="padding: 20px;">
    <p>Hello there,</p>
    <p>Thank you for subscribing to our newsletter. Here are some updates:</p>
    
    <ul>
      <li>New product releases</li>
      <li>Upcoming events</li>
      <li>Special promotions</li>
    </ul>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://example.com" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Learn More</a>
    </div>
  </div>
  
  <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
    <p>© 2025 Example Company. All rights reserved.</p>
    <p><a href="#" style="color: #fff;">Unsubscribe</a> | <a href="#" style="color: #fff;">View in browser</a></p>
  </div>
</div>
  `);

  const [mjmlContent, setMjmlContent] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = () => {
    setIsProcessing(true);
    setError("");

    try {
      // Check if window.mjml is available
      if (!window.mjml) {
        throw new Error(
          "MJML browser library not loaded. Please include the script in your HTML."
        );
      }

      // Convert HTML to MJML
      const mjml = htmlToMjml(htmlContent, {
        validateOutput: false,
        preserveClassNames: true,
        inlineStyles: true,
        showWarnings: true,
      });

      setMjmlContent(mjml);

      // Generate preview HTML
      const result = window.mjml(mjml, { validationLevel: "soft" });
      if (result.errors && result.errors.length > 0) {
        console.warn("MJML validation warnings:", result.errors);
      }

      setPreviewHtml(result.html);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err.message || "An error occurred during conversion");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>HTML to MJML Email Converter</h1>
        <p>Convert your HTML to responsive email templates with MJML</p>
      </header>

      <main className="app-main">
        <div className="conversion-panel">
          <div className="editor-container">
            <h2>HTML Input</h2>
            <textarea
              className="editor"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Enter your HTML here..."
            />
          </div>

          <div className="controls">
            <button
              className="convert-button"
              onClick={handleConvert}
              disabled={isProcessing}
            >
              {isProcessing ? "Converting..." : "Convert to MJML"}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="editor-container">
            <h2>MJML Output</h2>
            <textarea
              className="editor"
              value={mjmlContent}
              readOnly
              placeholder="MJML output will appear here..."
            />
          </div>
        </div>

        {previewHtml && (
          <div className="preview-panel">
            <h2>Email Preview</h2>
            <div className="preview-container">
              <iframe
                title="Email Preview"
                className="preview-frame"
                srcDoc={previewHtml}
                frameBorder="0"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by html-to-mjml - Make your emails responsive across all
          clients
        </p>
      </footer>
    </div>
  );
}

export default App;

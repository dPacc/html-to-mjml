import React, { useState, useEffect } from "react";
import { htmlToMjml } from "html-to-mjml";
// Note: You need to include the MJML browser library separately
// For example: <script src="https://unpkg.com/mjml-browser"></script>

const HtmlToMjmlConverter = () => {
  const [htmlInput, setHtmlInput] = useState(`
<!DOCTYPE html>
<html>
<head>
  <title>Simple Email</title>
  <style>
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .button {
      background-color: #007bff;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to Our Newsletter</h1>
  </div>
  
  <div class="content">
    <p>Hello there,</p>
    <p>Thank you for subscribing to our newsletter!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://example.com" class="button">Read More</a>
    </div>
  </div>
</body>
</html>
  `);
  const [mjmlOutput, setMjmlOutput] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [error, setError] = useState("");

  // Convert HTML to MJML when input changes
  useEffect(() => {
    try {
      // Check if window.mjml is available (from mjml-browser script)
      if (!window.mjml) {
        setError(
          "MJML browser library is not loaded. Please include the script in your HTML."
        );
        return;
      }

      // Convert HTML to MJML
      const mjml = htmlToMjml(htmlInput, {
        validateOutput: false, // Set to false to get MJML output instead of HTML
        preserveClassNames: true,
        inlineStyles: true,
      });
      setMjmlOutput(mjml);

      // Generate HTML preview
      const htmlResult = window.mjml(mjml, { validationLevel: "soft" });
      setHtmlPreview(htmlResult.html);
      setError("");
    } catch (err) {
      setError(`Conversion error: ${err.message}`);
    }
  }, [htmlInput]);

  return (
    <div className="converter">
      <h1>HTML to MJML Converter</h1>

      {error && (
        <div
          className="error-message"
          style={{ color: "red", margin: "10px 0" }}
        >
          {error}
        </div>
      )}

      <div className="input-output" style={{ display: "flex", gap: "20px" }}>
        <div className="html-input" style={{ flex: 1 }}>
          <h2>HTML Input</h2>
          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            style={{ width: "100%", height: "400px", fontFamily: "monospace" }}
          />
        </div>

        <div className="mjml-output" style={{ flex: 1 }}>
          <h2>MJML Output</h2>
          <textarea
            value={mjmlOutput}
            readOnly
            style={{ width: "100%", height: "400px", fontFamily: "monospace" }}
          />
        </div>
      </div>

      <div className="preview" style={{ marginTop: "30px" }}>
        <h2>HTML Preview</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <iframe
            title="Email Preview"
            srcDoc={htmlPreview}
            style={{ width: "100%", height: "500px", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default HtmlToMjmlConverter;

/**
 * Simple example of using the html-to-mjml library in Node.js
 */
const { htmlToMjml } = require('../../dist/cjs/index');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');

// Simple HTML example
const htmlContent = `
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
    .footer {
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to Our Newsletter</h1>
  </div>
  
  <div class="content">
    <p>Hello there,</p>
    <p>Thank you for subscribing to our newsletter. We're excited to share the latest updates with you.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://example.com" class="button">Read More</a>
    </div>
    
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>Best regards,<br>The Team</p>
  </div>
  
  <div class="footer">
    <p>© 2025 Example Company. All rights reserved.</p>
    <p><a href="https://example.com/unsubscribe">Unsubscribe</a></p>
  </div>
</body>
</html>
`;

// Convert the HTML to MJML
const mjmlContent = htmlToMjml(htmlContent, {
  validateOutput: false, // Set to false to get MJML output
  preserveClassNames: true,
  inlineStyles: true
});

// Output the result
console.log('MJML output:');
console.log(mjmlContent);

// Save the result to a file
const outputPath = path.join(__dirname, 'simple-output.mjml');
fs.writeFileSync(outputPath, mjmlContent);
console.log(`MJML saved to: ${outputPath}`);

// Generate the final HTML for emails
const finalHtml = mjml(mjmlContent).html;

// Save the HTML to a file
const htmlOutputPath = path.join(__dirname, 'simple-output.html');
fs.writeFileSync(htmlOutputPath, finalHtml);
console.log(`Final HTML saved to: ${htmlOutputPath}`);

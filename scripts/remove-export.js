const fs = require('fs');
const path = require('path');

// Function to remove `export {};` from the second-to-last line
const removeExportStatement = (filePath) => {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Split the file into lines
    const lines = fileContent.split('\n');

    // Identify the second-to-last line
    const secondToLastLineIndex = lines.length - 2;

    // Check if the second-to-last line is `export {};`
    if (lines[secondToLastLineIndex].trim() !== 'export {};') {
      console.log(
        `No 'export {};' found on the second-to-last line in ${filePath}`,
      );
      return;
    }
    lines.splice(secondToLastLineIndex, 1); // Remove the second-to-last line
    const updatedContent = lines.join('\n');

    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Removed 'export {};' from the file.`);
  } catch (error) {
    console.error(`Error processing the file: ${error.message}`);
  }
};

const filePath = path.resolve(__dirname, '../www/talsec.js');
removeExportStatement(filePath);

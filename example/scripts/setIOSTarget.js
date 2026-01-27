const fs = require('fs');
const path = require('path');

const PROJECT_FILE = path.join(
  'platforms',
  'ios',
  'App.xcodeproj',
  'project.pbxproj',
);

const TARGET_VERSION = '13.0'; // The required deployment target

function updateDeploymentTarget(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(
      'Error: project.pbxproj not found. Make sure iOS platform is added.',
    );
    process.exit(1);
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find IPHONEOS_DEPLOYMENT_TARGET set to any version lower than TARGET_VERSION
  const regex = /IPHONEOS_DEPLOYMENT_TARGET = (\d+\.\d+);/g;

  let modified = false;
  content = content.replace(regex, (match, version) => {
    if (parseFloat(version) < parseFloat(TARGET_VERSION)) {
      modified = true;
      return `IPHONEOS_DEPLOYMENT_TARGET = ${TARGET_VERSION};`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(
      `Updated IPHONEOS_DEPLOYMENT_TARGET to ${TARGET_VERSION} in ${filePath}`,
    );
  } else {
    console.log(
      `No changes needed. Deployment target is already ${TARGET_VERSION} or higher.`,
    );
  }
}

updateDeploymentTarget(PROJECT_FILE);

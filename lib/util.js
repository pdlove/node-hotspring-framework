const fs = require('fs').promises;

async function checkFolderExists(folderPath) {
    try {
      await fs.access(folderPath);
      return true;
    } catch (error) {
      return false;
    }
  }

const checkFileExists = checkFolderExists

module.exports = {
    checkFolderExists, checkFileExists
};
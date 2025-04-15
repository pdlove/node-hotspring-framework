const fs = require('fs').promises;
const path = require('path');
const Handlebars = require("handlebars");

// Used to minify content
const CleanCSS = require('clean-css');
const UglifyJS = require("uglify-js");
const htmlMinify = require("html-minifier");

class HotspringClientPackage {
  fullName = '';
  packageName = '';
  namespace = '';
  stack = '';
  packageType = 'control';
  requiredPackages = [];
  basePath = '';

  
/*
  Files will be an object like so:
  {
    "index.html": {rawContent: '<html>....</html>', minContent: 'Minified version of the file', keepInMemory: true},
    "file2.html": {rawContent: '<html>....</html>', minContent: 'Minified version of the file', keepInMemory: true},
  }
  
  The "Combined" entry will be all minified version smooshed together.

  Later, we'll replace this process with importing the entries into the database.
*/

  cssFiles = {};
  cssCombined = '';
  
  htmlFiles = {};
  htmlCombined = '';
  
  jsFiles = {};
  jsCombined = '';

  ejsFiles = {};

  otherFiles = {};

  static async loadDefinition(inFile) {
    try {
      let myPackage = new HotspringClientPackage();

      myPackage.basePath = path.dirname(inFile);

      let defContents = await fs.readFile(inFile, 'utf8');
      let defFile = JSON.parse(defContents);

      myPackage.packageName = defFile.packageName;
      myPackage.namespace = defFile.namespace || '';
      myPackage.requiredPackages = defFile.requiredPackages || [];
      myPackage.startupClass = defFile.startupClass;
      myPackage.startupFunction = defFile.startupFunction;

      let cssFileList = defFile.cssFileList || [];
      let htmlFileList = defFile.htmlFileList || [];
      let jsFileList = defFile.jsFileList || [];
      let templateFileList = defFile.templateFileList || [];
      let otherFileList = defFile.otherFiles || [];

      myPackage.cssFiles = {};
      myPackage.cssCombined = ''
      for (let file of cssFileList) {
        let rawContent = await fs.readFile(path.join(myPackage.basePath, file), 'utf8');
        let minContent = new CleanCSS().minify(rawContent).styles
        myPackage.cssFiles[file] = { rawContent, minContent, keepInMemory: true };
        if (!myPackage.cssCombined)
          myPackage.cssCombined = myPackage.cssFiles[file].minContent;
        else
          myPackage.cssCombined += '\n' + myPackage.cssFiles[file].minContent;
      }

      myPackage.htmlFiles = {};
      myPackage.htmlCombined = ''
      for (let file of htmlFileList) {
        let rawContent = await fs.readFile(path.join(myPackage.basePath, file), 'utf8');
        let minContent = htmlMinify.minify(rawContent, { removeAttributeQuotes: true, collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true });
        myPackage.htmlFiles[file] = { rawContent, minContent, keepInMemory: true };
        if (!myPackage.htmlCombined)
          myPackage.htmlCombined = myPackage.htmlFiles[file].minContent;
        else
          myPackage.htmlCombined += '\n' + myPackage.htmlFiles[file].minContent;
      }

      myPackage.jsFiles = {};
      myPackage.jsCombined = ''
      for (let file of jsFileList) {
        let rawContent = await fs.readFile(path.join(myPackage.basePath, file), 'utf8');
        let minContent = UglifyJS.minify(rawContent).code;
        myPackage.jsFiles[file] = { rawContent, minContent, keepInMemory: true };
        if (!myPackage.jsCombined)
          myPackage.jsCombined = myPackage.jsFiles[file].rawContent;
        else
          myPackage.jsCombined += '\n' + myPackage.jsFiles[file].rawContent;
      }

      myPackage.templateFiles = {};
      for (let templateName in templateFileList) {
        let fileData = templateFileList[templateName];
        let rawContent = await fs.readFile(path.join(myPackage.basePath, fileData.file), 'utf8');
        let precompiled = Handlebars.precompile(rawContent);
        precompiled = precompiled;
        myPackage.templateFiles[templateName] = { templateName: templateName, filename: fileData.file, isPartial: fileData.isPartial, rawContent: rawContent, precompiled: precompiled }
      }        

      return myPackage;
    } catch (error) {
      console.error('Error loading definition:', error);
    }
  }

  listFiles() {

  }

  getCSS(minify) {
    if (minify) {

    } else {

    }
  }

  getHTML(minify) {
    if (minify) {

    } else {

    }
  }

  getJS(minify) {
    if (minify) {

    } else {

    }
  }

  getOther(filename) {

  }

}

module.exports = { HotspringClientPackage };
const { hotspring_Initalization } = require('./index');
const fs = require('fs').promises;
const path = require('path');



async function startProgram() {
    let config = null;
    //Load the config File
    try {
        // Check if the file exists
        await fs.access(path.join(__dirname, "config.json"));

        // Read and parse the JSON file
        const data = await fs.readFile(path.join(__dirname, "config.json"), 'utf-8');
        config = JSON.parse(data);


    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Config file not found, using default configuration');
        } else {
            console.error('Error reading or parsing the config file:', error);
        }
    }

    if (!config) config={};
    if (!config.appRoot) config.appRoot = __dirname;
    await hotspring_Initalization(config, true);

}
startProgram(); 
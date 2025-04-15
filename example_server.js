const { HotspringServer } = require('./index');
const fs = require('fs').promises;
const path = require('path');



async function startProgram() {
    let myHotspring = await HotspringServer.initialize({ appRoot: __dirname});
    myHotspring = null;

}
startProgram(); 
var loadedClientControls = {};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


class prgAPI {
    token = null;
    apiBase = location.protocol + '//' + location.host + '/api/';

    async getAPIData(endpoint) {
        const url = `${this.apiBase}${endpoint}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            console.log(json);
            return json;
        } catch (error) {
            console.error(error.message);
        }
    }

    getAPIURLwithToken(endpoint, version) {
        let url = `${this.apiBase}${endpoint}`;
        if (!version) version = 1;
        if (this.token) {        
            url = `${url}?token=${this.token}&version=${version}`
        } else {
            url = `${url}?version=${version}`
        }
        return url;
    }
}

async function initializeWebApp() {
    //Required Functions for Handlebars to work.
    Handlebars.registerHelper({
        eq: (v1, v2) => v1 === v2,
        ne: (v1, v2) => v1 !== v2,
        lt: (v1, v2) => v1 < v2,
        gt: (v1, v2) => v1 > v2,
        lte: (v1, v2) => v1 <= v2,
        gte: (v1, v2) => v1 >= v2,
        and() {
            return Array.prototype.every.call(arguments, Boolean);
        },
        or() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
        }
    });

}

var API = new prgAPI();

//Downloads the clientPackage into memory for use.
async function fetchClientControl(controlName) {
    if (loadedClientControls[controlName]) return;
    const apiEndpoint = `ui/${controlName}`;
    let thisControl = {}
    
    //Get the control Data from the endpoint
    try {
        thisControl = await API.getAPIData(apiEndpoint);
    } catch (error) {
        console.error(`Error fetching control data for ${controlName}: ${error.message}`);
    }



    //Setup the CSS link if needed
    try {
        if (thisControl.cssCombined) {
            //Create new tag
            thisControl.cssArea = document.createElement("link");
            thisControl.cssArea.rel="stylesheet";
            thisControl.cssArea.href= API.getAPIURLwithToken(`ui/${controlName}/css`);
            document.getElementsByTagName("head")[0].appendChild(thisControl.cssArea);
        }
    } catch (error) {
        console.error(`Error loading CSS for ${controlName}: ${error.message}`);
    }

    //Setup the Javascript if needed
    try {
        if (thisControl.jsCombined) {
            //Create new tag
            thisControl.jsArea = document.createElement("script");
            thisControl.jsArea.status = "not loaded";
            thisControl.jsArea.src = API.getAPIURLwithToken(`ui/${controlName}/js`);
            // Add event listener for when the script is loaded
            thisControl.jsArea.onload = () => {
                console.log(`Script loaded for ${controlName}`);
                thisControl.jsArea.status = "loaded";
            };

            // Add event listener for error handling
            thisControl.jsArea.onerror = () => {
                console.error(`Error loading script: ${url}`);
                thisControl.jsArea.status = "error";
            };           
                        
            document.getElementsByTagName("head")[0].appendChild(thisControl.jsArea);
        }
    } catch (error) {
        console.error(`Error loading Javascript for ${controlName}: ${error.message}`);
    }

    if (thisControl.jsArea) {
        while (thisControl.jsArea.status == "not loaded") {
            await sleep(10);
        }
    }

    loadedClientControls[controlName] = thisControl;
    for (let idx in thisControl.requiredPackages) {
        await fetchClientControl(thisControl.requiredPackages[idx]);
    }
}

//Loads an instance of a clientPackage with appropriate destination and data.
async function loadClientPackage(clientPackagName, destTag, parameters, autoCreate = true) {
    await fetchClientControl(clientPackagName);
    try {
        let thisPackage = loadedClientControls[clientPackagName];
        if (thisPackage.htmlCombined) {
            destTag.innerHTML = thisPackage.htmlCombined;
        } else {
            destTag.innerHTML = '';
        }      

        //If there are any handlebars templates, load them.
        thisPackage.templates={};
        if (thisPackage.templateFiles) {
            for (let template in thisPackage.templateFiles) {
                const thisTemplate = thisPackage.templateFiles[template];
                thisPackage.templates[template] = Handlebars.template(eval("("+thisTemplate.precompiled+")"));
                if (thisTemplate.isPartial)
                    Handlebars.partials[template]=thisPackage.templates[template];
            }
        }  


        if (thisPackage.startupClass && autoCreate) {
            const newControl = eval(`new ${thisPackage.startupClass}()`);
            newControl.clientPackage = thisPackage;
            await newControl.setParameters(parameters);
            await newControl.renderDOM(destTag);
            return newControl;
        }
    } catch (error) {
        console.error(error.message);
    }
}


async function unloadClientPackage(packageName, destTag) {

}
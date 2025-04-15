const { glob } = require("fs");
const { stack } = require("sequelize/lib/utils");

class HotspringJob {
    static jobTemplateID = 0;
    static stackName = '';
    static stack = null;
    static jobTemplateName = '';
    static fullName = '';
    static jobTemplateLanguage = '';
    static jobTemplateCommand = '';
    static jobTemplateType = 'user-initiated'; // user-initiated, scheduled, system-initiated;
    static description = '';

    static defaultInterval = 0;
    static defaultIntervalUnits = 's';
    static defaultRunCount = 1;
    static defaultConfiguration = {};

    static requiredModels = [];
    static defaultAccess = 'admin'; // admin, user, public

    

    static isEnabled = false;
    static supportsPause = false;
    static supportsCancel = false;
    static supportsUndo = false;

    event_statusChange(status, message) {console.log(status, message); return true; } // Return true to confirm the status change and stop processing.;
    event_jobComplete(status, message) { console.log("Job Complete", status, message); return true; } // Return true to confirm the job is complete and stop processing.;
    event_jobError(status, message) { return true; } // Return true to confirm the error is serious and stop processing. If the job can ubdo itself then it will try.
  
    
    async reportStatus(status, message) {
        console.log(status, message);
    }

    static async validateConfiguration(config) {
        //Verifies that the configuration is possibly correct
        try {
            const data = { status: "Job Not Implemented" }
            return data;
        }
        catch (err) {
            return err.message;
        }
    }

    static async requestJobExecution(config) {
        //Requests the job to be executed. This is the main entry point for the job.
        //Creates an entry in the job table and returns the jobID. The entry's status is set to 1. Indicating it is being created.

    }
    
    constructor(config) {
        this.loadConfig(this.config)
    }

    loadConfig(newConfig) {
        if (!newConfig) newConfig = {};
        this.config = {};
        for (const [key, value] of Object.entries(this.constructor.defaultConfiguration)) {
            //If the config value is set, use it.
            if (newConfig[key] !== undefined) {
                this.config[key] = newConfig[key];
                continue;                
            }
            //If the config value is already set, use it.
            if (this.config[key] !== undefined) {
                continue;                
            }
            //If the config value isn't set and a default exists, use it.
            if (value.default !== undefined) {
                this.config[key] = value.default;
                continue;
            }
            //If all else fails, set it to null so it isn't undefined.
            this.config[key] = null;
        }
    }


    async runJob(config) {
        //Starts the job. This is the main entry point for the job.
        //This is not expected to be awaited.
        try {
            const data = { status: "Job Not Implemented" }
            return data;
        }
        catch (err) {
            return err.message;
        }
    }

    async cancelJob(attemptUndo) {
        //Cancel the job. If this job is one that supports undo, then try to undo the job unless the attemptUndo flag is false.
        try {
            // Add code to handle soft deletes
            const data = { status: "Job Not Implemented" }
            return data;
        }
        catch (err) {
            return err.message;
        }
    }

    async pauseJob() {
        //Pause the job.
        try {
            // Add code to handle soft deletes
            const data = { status: "Job Not Implemented" }
            return data;
        }
        catch (err) {
            return err.message;
        }
    }

    static async updateDatabaseTemplateObject() {
        let model = await this.hotspring.stacks['system'].models['jobtemplate']
        let dbObject = await model.browseObjects({filter: {jobTemplateName: this.jobTemplateName, stack: this.stackName}});
        if (dbObject.length!=0) { 
            this.jobTemplateID = dbObject[0].jobTemplateID;
            this.isEnabled = dbObject[0].isEnabled;
            //All other fields should be updated from this class's configuration.
        }
        if (this.jobTemplateID==0) { this.jobTemplateID = null; }
        dbObject = await model.addOrEditObject({ jobTemplateID: this.jobTemplateID, stack: this.stackName, jobTemplateName: this.jobTemplateName, jobTemplateLanguage: this.jobTemplateLanguage, jobTemplateCommand: this.jobTemplateCommand, 
            jobTemplateType: this.jobTemplateType, description: this.description, defaultInterval: this.defaultInterval, defaultIntervalUnits: this.defaultIntervalUnits, defaultRunCount: this.defaultRunCount, 
            defaultConfiguration: this.defaultConfiguration, isEnabled: this.isEnabled, supportsPause: this.supportsPause, supportsCancel: this.supportsCancel, supportsUndo: this.supportsUndo});
        this.jobTemplateID = dbObject.jobTemplateID;
        
        dbObject = dbObject
    }
        

}

module.exports = { HotspringJob };


const { HotspringJob } = require('../../../lib/hotspringJob.js');

class ListFiles extends HotspringJob {
    static fullName = '';
    static name = '';
    static namespace = '';
    static stack = '';
    static jobType = 'user-initiated'; // user-initiated, scheduled, system-initiated
    static requiredModels = [];
    static defaultAccess = 'admin'; // admin, user, public

    static configurationModel = {};

    
    static supportsPause = false;
    static supportsCancel = false;
    static supportsUndo = false;

    event_statusChange(status, message) {console.log(status, message); return true; } // Return true to confirm the status change and stop processing.;
    event_jobComplete(status, message) { console.log("Job Complete", status, message); return true; } // Return true to confirm the job is complete and stop processing.;
    event_jobError(status, message) { return true; } // Return true to confirm the error is serious and stop processing. If the job can ubdo itself then it will try.
    

    async reportStatus(status, message) {
        console.log(status, message);
    }

    static async validateConfiguration() {
        //Verifies that the configuration is possibly correct
        try {
            const data = { status: "Job Not Implemented" }
            return data;
        }
        catch (err) {
            return err.message;
        }
    }

    async runJob() {
        //Starts the job. This is the main entry point for the job.
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
}

module.exports = { HotspringJob };
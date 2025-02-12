const { HotspringObjectType, DataTypes } = require('../../../lib/HotspringObjectType');

class Job extends HotspringObjectType {
  name = 'job';
  autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  defaultWriteAccess = 'admin'; //admin, user, public
  defaultReadAccess = 'admin'; //admin, user, public

  sequelizeDefinition = {
    jobID: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    status: {type: DataTypes.SMALLINT, defaultValue: 0, allowNull: false, enumValues: {0: 'Created', 1: 'UnProcessed', 2:'Processed', 3:'Error', 4:'Ignored'}, },    
    defaultInterval: { type: DataTypes.INTEGER, allowNull: false},
    defaultIntervalUnits: { type: DataTypes.STRING, allowNull: false },
    defaultRunCount: { type: DataTypes.INTEGER, allowNull: false},
    jobType: { type: DataTypes.STRING, allowNull: true },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false }
  };

//   sequelizeConnections = [
//     { connection: "1M", parentType: "inventory.networkdevice", parentKey: "deviceID", childType: "syslog.LogBatch", childKey: "sourceDeviceID" },
//     { connection: "1M", parentType: "inventory.networkdevice", parentKey: "deviceID", childType: "syslog.LogBatch", childKey: "collectorID" },
//     { connection: "1M", parentType: "inventory.networkdevice", parentKey: "deviceID", childType: "syslog.LogBatch", childKey: "processingByID" },
//     // { connection: "MM", type1: "system.group", Key1: "groupID", type2: "system.menu", Key2: "menuID", midType: "system.group_menu" }
//   ]
}
module.exports = Job;
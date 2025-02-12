const { HotspringObjectType, DataTypes } = require('../../../lib/HotspringObjectType');

class Organization extends HotspringObjectType {
  name = 'organization';
  autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  defaultWriteAccess = 'admin'; //admin, user, public
  defaultReadAccess = 'user'; //admin, user, public

  sequelizeDefinition = {
    organizationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    streetAddress: { type: DataTypes.STRING, allowNull: true },
    phonenumber: { type: DataTypes.STRING, allowNull: true },
    primaryUserID: { type: DataTypes.INTEGER, allowNull: false }    
};
  sequelizeConnections = [
    // { connection: "1M", parentType: "system.menu", parentKey: "menuID", childType: "system.group_menu", childKey: "menuID" },
    // { connection: "MM", type1: "system.group", Key1: "groupID", type2: "system.menu", Key2: "menuID", midType: "system.group_menu" }
  ]
}

module.exports = Organization;

const { HotspringObjectType, DataTypes } = require('../../../../lib/HotspringObjectType');

class Group extends HotspringObjectType {
  name = 'group';
  autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  defaultWriteAccess = 'admin'; //admin, user, public
  defaultReadAccess = 'admin'; //admin, user, public

  sequelizeDefinition = {
    groupId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(1024) }
};
  sequelizeConnections = [
    { connection: "1M", parentType: "system.group", parentKey: "groupID", childType: "system.group_menu", childKey: "groupID" },
    { connection: "MM", type1: "system.group", Key1: "groupID", type2: "system.menu", Key2: "menuID", midType: "system.group_menu" }
  ]
}

module.exports = Group;

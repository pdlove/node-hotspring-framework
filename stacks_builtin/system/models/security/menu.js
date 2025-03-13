const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class Menu extends HotspringModel {
  static modelName = 'menu';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'user'; //admin, user, public
  static defaultBrowsePageSize = 0; // 0 means no limit

  static sequelizeDefinition = {
    menuID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    iconText: { type: DataTypes.STRING(255) },
    iconClass: { type: DataTypes.STRING(255) },
    parent_menu_id: { type: DataTypes.INTEGER },
    external_link: { type: DataTypes.STRING(255) },
    clientPackage: { type: DataTypes.STRING(255) },
    clientPackageParameters: { type: DataTypes.JSON },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    debug: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    production: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    stackId: { type: DataTypes.INTEGER, allowNull: false }
  };
  static sequelizeConnections = [
    { connection: "1M", parentType: "system.stack", parentKey: "stackId", childType: "system.menu", childKey: "stackId" },
    { connection: "1M", parentType: "system.menu", parentKey: "menuID", childType: "system.group_menu", childKey: "menuID" },
    { connection: "MM", type1: "system.group", Key1: "groupID", type2: "system.menu", Key2: "menuID", midType: "system.group_menu" }
  ]
  static seedData = [
    {
      name: 'Home', parent_menu_id: null, clientPackage: "system.template", clientPackageParameters:
        [{ "name": "Test Item 1", description: "This is just an example of item #1." },
        { "name": "Test Item 2", description: "This is just an example of item #2." },
        { "name": "Test Item 3", description: "This is just an example of item #3." },
        { "name": "Test Item 4", description: "This is just an example of item #4." },
        { "name": "Test Item 5", description: "This is just an example of item #5." },
        { "name": "Test Item 6", description: "This is just an example of item #6." },
        { "name": "Test Item 7", description: "This is just an example of item #7." },
        { "name": "Test Item 8", description: "This is just an example of item #8." },
        { "name": "Test Item 9", description: "This is just an example of item #9." },
        { "name": "Test Item 10", description: "This is just an example of item #10." },
        { "name": "Test Item 11", description: "This is just an example of item #11." },
        { "name": "Test Item 12", description: "This is just an example of item #12." }], stackId: 1
    },
    { name: 'Administration', parent_menu_id: null, stackId: 1 },
    { name: 'Stacks', parent_menu_id: 2, stackId: 1, clientPackage: "system.raw-data-table", clientPackageParameters: { stack: "system", model: "stack" } },
    { name: 'Security', parent_menu_id: 2, stackId: 1 },
    { name: 'Users', parent_menu_id: 4, stackId: 1 },
    { name: 'Raw Data', parent_menu_id: null, stackId: 1, clientPackage: "system.uiMenu", clientPackageParameters: { subMenu: "models" } }
  ];
}

module.exports = Menu;




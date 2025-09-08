const { BaseModel } = require('./BaseModel');

class Workspace extends BaseModel {
  static get tableName() {
    return 'workspaces';
  }
}

module.exports = { Workspace };

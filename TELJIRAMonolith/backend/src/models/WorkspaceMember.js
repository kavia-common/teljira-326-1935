const { BaseModel } = require('./BaseModel');

class WorkspaceMember extends BaseModel {
  static get tableName() {
    return 'workspace_members';
  }
}

module.exports = { WorkspaceMember };

const { BaseModel } = require('./BaseModel');

class Project extends BaseModel {
  static get tableName() {
    return 'projects';
  }
}

module.exports = { Project };

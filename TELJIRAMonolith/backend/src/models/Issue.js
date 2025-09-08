const { BaseModel } = require('./BaseModel');

class Issue extends BaseModel {
  static get tableName() {
    return 'issues';
  }
}

module.exports = { Issue };

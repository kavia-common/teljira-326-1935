const { BaseModel } = require('./BaseModel');

class Sprint extends BaseModel {
  static get tableName() {
    return 'sprints';
  }
}

module.exports = { Sprint };

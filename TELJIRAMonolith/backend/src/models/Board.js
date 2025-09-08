const { BaseModel } = require('./BaseModel');

class Board extends BaseModel {
  static get tableName() {
    return 'boards';
  }
}

module.exports = { Board };

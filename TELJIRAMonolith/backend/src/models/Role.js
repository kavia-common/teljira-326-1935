const { BaseModel } = require('./BaseModel');

class Role extends BaseModel {
  static get tableName() {
    return 'roles';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } }
      }
    };
  }
}

module.exports = { Role };

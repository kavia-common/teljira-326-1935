const { BaseModel } = require('./BaseModel');

class AuditLog extends BaseModel {
  static get tableName() {
    return 'audit_log';
  }
}

module.exports = { AuditLog };

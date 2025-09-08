const { BaseModel } = require('./BaseModel');

class User extends BaseModel {
  static get tableName() {
    return 'users';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'name'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string' },
        name: { type: 'string' },
        password_hash: { type: 'string' },
        mfa_enabled: { type: 'boolean' },
        mfa_secret: { type: 'string' }
      }
    };
  }
  static get relationMappings() {
    // lazy import to avoid cycles
    const { Role } = require('./Role');
    const { WorkspaceMember } = require('./WorkspaceMember');
    return {
      roles: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'users.id',
          through: {
            from: 'user_roles.user_id',
            to: 'user_roles.role_id',
            extra: ['scope'] // global or workspace/project
          },
          to: 'roles.id'
        }
      },
      memberships: {
        relation: BaseModel.HasManyRelation,
        modelClass: WorkspaceMember,
        join: {
          from: 'users.id',
          to: 'workspace_members.user_id'
        }
      }
    };
  }
}

module.exports = { User };

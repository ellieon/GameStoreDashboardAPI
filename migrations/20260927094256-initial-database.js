'use strict';
import { generateApiKey } from '../src/common/generateApiKey.js';

var dbm;
var type;
var seed;
/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
export async function setup(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

export async function up(db) {
  db.createTable('users', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      notNull: true,
    },
    name: {
      type: 'text',
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true
    }
  });

  db.createTable('user_keys', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      notNull: true,
    },
    user_id: {
      type: 'int',
      notNull: true
    },
    api_key: {
      type: 'text',
      notNull: true,
      unique: true
    },
    active: {
      type: 'boolean',
      notNull: true,
      default: 'true'
    },
    permissions: {
      type: 'jsonb',
      notNull: true
    }

  }).then(() => {
    db.addForeignKey('user_keys', 'users', 'user_keys_user_id_foreign',
      {
        'user_id': 'id'
      },
      {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
      }
    )
    db.insert('users', ['name', 'email'], [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL])
    db.insert('user_keys', ['user_id', 'api_key', 'active', 'permissions'], [1, generateApiKey(), true, JSON.stringify(["admin"])])
  });
  return null;
};

export async function down(db) {
  db.dropTable('games')
  db.dropTable('settings')
  return null;
};
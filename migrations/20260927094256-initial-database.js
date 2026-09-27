'use strict';
import { hashKeyWithSalt } from './common/generateApiKey.js';
import { getRequiredEnvVar } from './common/getRequiredEnvVar.js';

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
  await db.createTable('users', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      notNull: true,
    },
    name: {
      type: 'text',
      notNull: true,
      unique: true
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true
    }
  });

  await db.createTable('user_keys', {
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
    api_key_hash: {
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

  })

  await db.addForeignKey('user_keys', 'users', 'user_keys_user_id_foreign',
    {
      'user_id': 'id'
    },
    {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    }
  )
  const adminName = getRequiredEnvVar('ADMIN_NAME')
  await db.insert('users', ['name', 'email'], [adminName, process.env.ADMIN_EMAIL])
  const user = await db.runSql('select id from users where name = ?', [adminName])
  const id = user.rows[0].id
  const apiKey = getRequiredEnvVar('INITIAL_ADMIN_API_KEY')
  await db.insert('user_keys', ['user_id', 'api_key_hash', 'active', 'permissions'], [id, hashKeyWithSalt(apiKey, getRequiredEnvVar('API_SECRET')), true, JSON.stringify(["admin"])])

  return null;
};

export async function down(db) {
  await db.dropTable('user_keys')
  await db.dropTable('users')
  return null;
};
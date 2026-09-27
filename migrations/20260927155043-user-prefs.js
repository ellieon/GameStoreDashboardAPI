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
  await db.createTable('user_prefs', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      notNull: true,
    },
    user_id: {
      type: 'int',
      notNull: true,
      unique: true,
    },
    stores: {
      type: 'jsonb',
      notNull: true
    },
    categories: {
      type: 'jsonb',
      notNull: true
    }
  })

  await db.addForeignKey('user_prefs', 'users', 'user_prefs_user_id_foreign',
    {
      'user_id': 'id'
    },
    {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    }
  )

  return null;
};

export async function down(db) {
  await db.dropTable('user_prefs')
  return null;
};
'use strict';

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
  await db.createTable('user_store_states', {
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
    date_taken: {
      type: 'datetime',
      notNull: true
    },
    state: {
      type: 'jsonb',
      notNull: true
    }
  })

  await db.addForeignKey('user_store_states', 'users', 'user_store_states_user_id_foreign',
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
  await db.dropTable('user_store_states')
  return null;
};
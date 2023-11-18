import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Subscription } from '../types/index.types.js';
sqlite3.verbose();

export const openDb = async () => {
  return open({
    filename: '../subs.db',
    driver: sqlite3.Database,
  });
};

export const initialDatabase = async () => {
  const database = await openDb();

  database.run(`CREATE TABLE if not exists subscriptions(id INTEGER PRIMARY KEY, userId INTEGER)`);
};

export const returnUserSub = async (id: number) => {
  const query = `SELECT * FROM subscriptions WHERE userId = ${id}`;
  const db = await openDb();

  return db.get(query) as unknown as Subscription | null;
};

export const returnAllSubs = async () => {
  const query = `SELECT userId FROM subscriptions`;
  const db = await openDb();

  return db.all(query) as unknown as Subscription[];
};

export const enableUserSub = async (id: number) => {
  const userSub = await returnUserSub(id);
  const database = await openDb();

  if (userSub) return false;

  await database.run('INSERT INTO subscriptions (userId) VALUES (?)', id);

  return true;
};

export const disableUserSub = async (id: number) => {
  const database = await openDb();
  const userSub = await returnUserSub(id);

  if (!userSub) return false;

  await database.run('DELETE FROM subscriptions WHERE userId = ?', id);

  return true;
};

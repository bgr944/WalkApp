import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('walkingApp.db');

export const initializeDatabase = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS walks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          duration INTEGER NOT NULL,
          points INTEGER NOT NULL,
          date TEXT NOT NULL,
          difficulty TEXT NOT NULL
        );`,
        [],
        () => {
          console.log('Table "walks" created successfully.');
        },
        (error) => {
          console.error('Error creating table "walks":', error);
        }
      );
    });
  };

export default db;
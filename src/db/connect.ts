const fs = require('fs');
const electron = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

const userDataPath = electron.app.getPath('userData');
const dbFolderPath = path.join(userDataPath, 'Database');
const dbPath = path.join(dbFolderPath, 'todo.db');

// Check if the folder exists, if not, create it
if (!fs.existsSync(dbFolderPath)) {
    fs.mkdirSync(dbFolderPath);
}

const db = new Database(dbPath, {});

db.exec(`
    CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0
    );
`);

console.log(db)

module.exports = db;

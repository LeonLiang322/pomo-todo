import fs from 'fs';
import electron, { ipcMain } from 'electron';
import path from 'path';

function initDataBase() {
    const userDataPath = electron.app.getPath('userData');
    const dbFolderPath = path.join(userDataPath, 'Database');
    const dbPath = path.join(dbFolderPath, 'todo.db');

    // Check if the folder exists, if not, create it
    if (!fs.existsSync(dbFolderPath)) {
        fs.mkdirSync(dbFolderPath);
    }

    const db = require('better-sqlite3')(dbPath, {
        // verbose: console.log
    });

    db.exec(`
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            note TEXT DEFAULT NULL,
            is_important BOOLEAN DEFAULT 0,
            is_completed BOOLEAN DEFAULT 0,
            is_failed BOOLEAN DEFAULT 0,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            update_time TIMESTAMP DEFAULT NULL,
            due_time TIMESTAMP DEFAULT NULL,
            finish_time TIMESTAMP DEFAULT NULL,
            list_id INTEGER DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log(db)

    ipcMain.on('task-add', (event, args) => {
        const columns = [];
        const values = [];
        const placeholders = [];

        for (const key in args) {
            if (args.hasOwnProperty(key)) {
                columns.push(key);
                values.push(args[key]);
                placeholders.push('?');
            }
        }

        const sql = `INSERT INTO task (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
        const stmt = db.prepare(sql);
        event.returnValue = stmt.run(...values);
    });

    ipcMain.on('task-get-all', (event, args) => {
        const stmt = db.prepare('SELECT * FROM task');
        event.returnValue = stmt.all();
    });

    ipcMain.on('task-get-by-id', (event, args) => {
        const stmt = db.prepare('SELECT * FROM task WHERE id = ?');
        event.returnValue = stmt.get(args);
    });


}

export default initDataBase;

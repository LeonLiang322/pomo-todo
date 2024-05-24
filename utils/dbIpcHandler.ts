import fs from 'fs';
import electron, { ipcMain } from 'electron';
import path from 'path';

function initDataBase() {
    const userDataPath = electron.app.getPath('userData');
    const dbFolderPath = path.join(userDataPath, 'Database');
    const dbPath = path.join(dbFolderPath, 'todo.db');

    if (!fs.existsSync(dbFolderPath)) {
        fs.mkdirSync(dbFolderPath);
    }

    const db = require('better-sqlite3')(dbPath);

    db.exec(`
        CREATE TABLE IF NOT EXISTS task (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            note TEXT DEFAULT NULL,
            due_date DATE DEFAULT NULL,
            completed BOOLEAN DEFAULT 0,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            update_time TIMESTAMP DEFAULT NULL,
            finish_time TIMESTAMP DEFAULT NULL,
            list_id INTEGER NOT NULL DEFAULT 1,
            pinned BOOLEAN DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            complete_count INTEGER DEFAULT 0,
            todo_count INTEGER DEFAULT 0,
            pinned BOOLEAN DEFAULT 0
        );

        INSERT OR IGNORE INTO list (id, name) VALUES (1, 'default');

        -- 插入任务时增加todo_count
        CREATE TRIGGER IF NOT EXISTS after_task_insert
        AFTER INSERT ON task
        FOR EACH ROW
        BEGIN
            UPDATE list SET todo_count = todo_count + 1 WHERE id = NEW.list_id;
        END;

        -- 删除任务时更新complete_count和todo_count
        CREATE TRIGGER IF NOT EXISTS after_task_delete
        AFTER DELETE ON task
        FOR EACH ROW
        BEGIN
            UPDATE list SET
                todo_count = CASE WHEN OLD.completed = 0 THEN todo_count - 1 ELSE todo_count END,
                complete_count = CASE WHEN OLD.completed = 1 THEN complete_count - 1 ELSE complete_count END
            WHERE id = OLD.list_id;
        END;
        
        -- 删除列表时删除列表下的任务
        CREATE TRIGGER IF NOT EXISTS after_list_delete
        AFTER DELETE ON list
        FOR EACH ROW
        BEGIN
            DELETE FROM task WHERE list_id = OLD.id;
        END;

        -- 更新任务的completed属性时调整complete_count和todo_count
        CREATE TRIGGER IF NOT EXISTS after_task_update
        AFTER UPDATE OF completed ON task
        FOR EACH ROW
        BEGIN
            UPDATE list SET
                todo_count = CASE WHEN OLD.completed = 0 AND NEW.completed = 1 THEN todo_count - 1 WHEN OLD.completed = 1 AND NEW.completed = 0 THEN todo_count + 1 ELSE todo_count END,
                complete_count = CASE WHEN OLD.completed = 0 AND NEW.completed = 1 THEN complete_count + 1 WHEN OLD.completed = 1 AND NEW.completed = 0 THEN complete_count - 1 ELSE complete_count END
            WHERE id = NEW.list_id;
        END;
        
        -- 更新任务的list_id属性时调整complete_count和todo_count
        CREATE TRIGGER IF NOT EXISTS after_task_update_list_id
        AFTER UPDATE OF list_id ON task
        FOR EACH ROW
        BEGIN
            UPDATE list SET
                todo_count = CASE WHEN OLD.completed = 0 THEN todo_count - 1 ELSE todo_count END,
                complete_count = CASE WHEN OLD.completed = 1 THEN complete_count - 1 ELSE complete_count END
            WHERE id = OLD.list_id;
            
            UPDATE list SET
                todo_count = CASE WHEN NEW.completed = 0 THEN todo_count + 1 ELSE todo_count END,
                complete_count = CASE WHEN NEW.completed = 1 THEN complete_count + 1 ELSE complete_count END
            WHERE id = NEW.list_id;
        END;
    `);

    ipcMain.on('db-operation', (event, args) => {
        const { action, table, data, id, condition } = args;
        let stmt, result;

        switch (action) {
            case 'insert':
                const columns = Object.keys(data);
                const values = Object.values(data);
                const placeholders = columns.map(() => '?').join(', ');
                stmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
                result = stmt.run(...values);
                break;
            case 'update':
                const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
                stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`);
                result = stmt.run(...Object.values(data), id);
                break;
            case 'delete':
                stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
                result = stmt.run(id);
                break;
            case 'select':
                stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
                result = stmt.get(id);
                break;
            case 'select-all':
                stmt = db.prepare(`SELECT * FROM ${table} ${condition}`);
                result = stmt.all();
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        event.returnValue = result;
    });

}

export default initDataBase;

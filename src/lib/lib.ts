interface Task {
    id: number;
    description: string;
    note: string;
    completed: boolean;
    create_time: string;
    update_time: string;
    due_time: string;
    finish_time: string;
    list_id: number;
    pinned: boolean;
}

interface TaskList {
    id: number;
    name: string;
    todo_count: number;
    complete_count: number;
    pinned: boolean;
}

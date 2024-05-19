interface WindowState {
    bounds: {
        width: number;
        height: number;
        x?: number;
        y?: number;
    };
    isMaximized: boolean;
}

interface TimerCtlMsg {
    command: string;
    duration?: number;
}

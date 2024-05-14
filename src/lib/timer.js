import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

class CountdownTimer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration; // 倒计时长（以毫秒为单位）
        this.remaining = duration;
        this.onTick = onTick; // 每次更新时的回调函数
        this.onComplete = onComplete; // 完成倒计时的回调函数
        this.timerId = null;
        this.startTime = null;
        this.paused = true;
    }

    start() {
        if (!this.paused) return;
        this.paused = false;
        this.startTime = dayjs();
        this.tick();
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        clearTimeout(this.timerId);
        this.remaining -= dayjs().diff(this.startTime);
    }

    resume() {
        if (!this.paused) return;
        this.paused = false;
        this.startTime = dayjs();
        this.tick();
    }

    stop() {
        this.paused = true;
        clearTimeout(this.timerId);
        this.remaining = this.duration;
    }

    tick() {
        if (this.paused) return;

        const elapsed = dayjs().diff(this.startTime);
        const remaining = this.remaining - elapsed;

        if (remaining <= 0) {
            this.onComplete();
            this.stop();
        } else {
            this.onTick(remaining);
            this.timerId = setTimeout(() => this.tick(), 100);
        }
    }

    getRemainingTime() {
        if (this.paused) {
            return this.remaining;
        } else {
            const elapsed = dayjs().diff(this.startTime);
            return this.remaining - elapsed;
        }
    }
}

export default CountdownTimer;

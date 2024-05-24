import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn.js'
dayjs.locale('zh-cn')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert seconds to 00:00 format
export function secondsToMs(s: number) {
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date | string, format = 'YYYY年MM月DD日') {
  return dayjs(date).format(format)
}

export function formatTime(time: Date | string, format = 'YYYY年MM月DD日 HH:mm') {
    return dayjs(time).format(format)

}

export function getCurrentTime() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export function getDateFromToday(add: number) {
  return dayjs().add(add, 'day').format('YYYY-MM-DD')
}


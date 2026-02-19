import { create } from 'zustand'
import { type ValueOrCallback, setState } from './utils/setState'

export interface StatisticsStore {
  minutesFocusedToday: number
  setMinutesFocusedToday: (minutes: ValueOrCallback<number>) => void
}

export const useStatisticsStore = create<StatisticsStore>(set => ({
  minutesFocusedToday: 0,
  setMinutesFocusedToday: state => set(s => setState(s, 'minutesFocusedToday', state, value => value))
}))

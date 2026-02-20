import { create } from 'zustand'
import { type ValueOrCallback, setState } from './utils/setState'

export interface StatisticsStore {
  secondsFocusedToday: number
  setSecondsFocusedToday: (state: ValueOrCallback<number>) => void
}

export const useStatisticsStore = create<StatisticsStore>(set => ({
  secondsFocusedToday: 0,
  setSecondsFocusedToday: state => set(s => setState(s, 'secondsFocusedToday', state, value => value))
}))

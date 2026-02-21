import { create } from 'zustand'
import { type ValueOrCallback, setState } from './utils/setState'

export interface StatisticsStore {
  secondsFocusedToday: number | null
  setSecondsFocusedToday: (state: ValueOrCallback<number | null>) => void
}

export const useStatisticsStore = create<StatisticsStore>(set => ({
  secondsFocusedToday: null,
  setSecondsFocusedToday: state => set(s => setState(s, 'secondsFocusedToday', state, value => value))
}))

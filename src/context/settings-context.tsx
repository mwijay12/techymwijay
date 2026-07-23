'use client'
/**
 * App Settings Context
 * Full implementation: Prompt 4
 */
import { createContext, useContext } from 'react'

interface SettingsContextType {
  isLoaded: boolean
}

export const SettingsContext = createContext<SettingsContextType>({
  isLoaded: false,
})

export const useSettings = () => useContext(SettingsContext)

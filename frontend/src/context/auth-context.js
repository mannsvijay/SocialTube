import { createContext } from 'react'

// kept out of AuthContext.jsx so that file only exports components (needed for React fast refresh)
export const AuthContext = createContext(null)

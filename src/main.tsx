import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { PlayerWrapper } from './Player.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PlayerWrapper />
  </React.StrictMode>,
)

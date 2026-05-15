import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // <--- DIESE ZEILE MUSS DA SEIN

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
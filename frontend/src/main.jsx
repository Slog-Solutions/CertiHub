import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { API_BASE_URL } from './config'
import './index.css'

// Configure global Axios defaults
axios.defaults.baseURL = API_BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

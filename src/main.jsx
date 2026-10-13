import "@fontsource-variable/lexend";
import "@fontsource/opendyslexic";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Spike from "./spike/Spike.jsx"; 

const Root = window.location.hash === "#spike" ? Spike : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)

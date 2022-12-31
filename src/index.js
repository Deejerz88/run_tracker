import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';

import * as serviceWorker from "./serviceWorkerRegistration.js";
import { toast } from "react-toastify";

serviceWorker.register({
  onUpdate: (registration) => {
    console.log("registration", registration, registration.waiting);
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    toast.success("New version available, reloading in 3 seconds", {
      autoClose: 3000,
      onClose: () => {
        window.location.reload();
      },
      onClick: () => {
        window.location.reload();
      },
      pauseOnHover: false,
    });
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

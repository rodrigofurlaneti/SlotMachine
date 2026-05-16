import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        theme="dark"
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: "#161616",
            border: "1px solid rgba(245, 197, 24, 0.35)",
            color: "#f5f5f5",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

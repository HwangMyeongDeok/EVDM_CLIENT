import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";
import { AppProvider } from "@/app/provider.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
       <Toaster />
      <App />
    </AppProvider>
  </StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireStep from "./components/RequireStep";
import Create from "./pages/Create";
import Style from "./pages/Style";
import Generate from "./pages/Generate";
import Preview from "./pages/Preview";
import Export from "./pages/Export";
import { ProjectProvider } from "./state/ProjectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ProjectProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/create" />} />
          <Route path="/create" element={<Create />} />
          <Route
            path="/style"
            element={
              <RequireStep stepId="style">
                <Style />
              </RequireStep>
            }
          />
          <Route
            path="/generate"
            element={
              <RequireStep stepId="generate">
                <Generate />
              </RequireStep>
            }
          />
          <Route
            path="/preview"
            element={
              <RequireStep stepId="preview">
                <Preview />
              </RequireStep>
            }
          />
          <Route
            path="/export"
            element={
              <RequireStep stepId="export">
                <Export />
              </RequireStep>
            }
          />
        </Route>
      </Routes>
    </ProjectProvider>
  </BrowserRouter>
);

// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Approute from "./router/Approute";
import "./i18n";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Approute />
      </Router>
    </AuthProvider>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "./context/AuthContext";
import Approute from "./router/Approute";
import i18n from "./i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <Router>
            <Approute />
          </Router>
        </AuthProvider>
      </I18nextProvider>
      {/*  React Query DevTools - Shows cache, queries, mutations in real-time */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

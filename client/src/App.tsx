import * as React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import StreamPage from "./pages/Stream";
import WatchPage from "./pages/Watch";

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/watch" element={<WatchPage />} />
      <Route path="/stream" element={<StreamPage />} />
    </Routes>
  );
};

export default App;

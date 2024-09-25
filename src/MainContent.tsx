// MainContent.tsx

import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 p-4">
        {/* The Outlet renders the matching child route component */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainContent;

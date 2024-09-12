// Layout.tsx
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";

const Layout = () => {
  return (
    <div className="flex p-5 gap-4 ">
      <div className="bg-slate-900">
      <Sidebar />
      </div>

      <Dashboard />
    </div>
  );
};

export default Layout;

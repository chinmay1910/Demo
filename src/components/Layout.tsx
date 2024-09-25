// Layout.tsx
import Dashboard from "./Dashboard";
import TreeUI from "./TreeUI";
import { Input } from "./Input";
import { Label } from "../common/Label";
import logo from '../assets/logo.svg';
import { Blocks, ChartPie, LayoutList, FileInput } from "lucide-react";
import { UserProfileDesktop } from "./UserProfile";
const sampleData = [
  {
    name: "Factory A (32)",
    children: [
      {
        name: "Section 1",
        children: [
          { name: "Asset 1.1", status: "normal" },
          { name: "Asset 1.2", status: "alert" },
          { name: "Asset 1.3", status: "normal" },
          { name: "Asset 1.4", status: "alert" },
          { name: "Asset 1.5", status: "normal" },
          { name: "Asset 1.6", status: "alert" },
        ]
      },
      {
        name: "Section 2",
        children: [
          { name: "Asset 2.1", status: "warning" },
          { name: "Asset 2.2", status: "offline" },
          { name: "Asset 1.3", status: "normal" },
          { name: "Asset 1.4", status: "alert" },
          { name: "Asset 1.5", status: "normal" },
          { name: "Asset 1.6", status: "alert" },
        ]
      }
    ]
  },
  {
    name: "Factory B",
    children: [
      {
        name: "Section 3",
        children: [
          { name: "Asset 3.1", status: "normal" },
          { name: "Asset 3.2", status: "alert" },
          { name: "Asset 1.3", status: "normal" },
          { name: "Asset 1.4", status: "alert" },
          { name: "Asset 1.5", status: "normal" },
          { name: "Asset 1.6", status: "alert" },

        ]
      }
    ]
  }
];

const Layout = () => {
  return (
    <div className="flex h-screen bg-slate-50 p-3 ">
      <div className="flex h-full w-full gap-8 overflow-hidden">
        <div className="flex flex-col justify-between h-full w-[300px] min-w-[250px] overflow-y-auto rounded-xl bg-slate-900">
          <div>
            <div className="mt-4 flex flex-col gap-3 p-6">
              <div className="h-7">
                <img src={logo} className="h-7 mx-auto w-[220px]" alt="Logo" />
              </div>
             

              <div>
                <hr className="border border-slate-700 mx-3 my-3"></hr>
                <p className="text-teal-200 text-xs py-2 ml-3 mb-1 ">Condition Monitoring</p>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-5 py-2.5 text-left text-sm font-medium text-white hover:bg-slate-800 hover:text-amber-100">
                  <ChartPie className="w-4 h-4 "></ChartPie>
                  Overview
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-slate-900"> 2
                  </span>
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-5 py-2.5 text-left text-sm font-medium text-white hover:bg-slate-800 hover:text-amber-100">
                  <LayoutList className="w-4 h-4 "></LayoutList>
                  Work Orders
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-slate-900"> 2
                  </span>
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-5 py-2.5 text-left text-sm font-medium text-white hover:bg-slate-800 hover:text-amber-100">
                  <FileInput className="w-4 h-4 "></FileInput>
                  Reports
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-slate-900"> 2
                  </span>
                </button>
                <hr className="border border-slate-700 mx-3 my-3"></hr>
                
                <div className="max-w-xs mx-2 mb-2 space-y-2">
                <Input
                  placeholder="Search Assets.."
                  id="search"
                  name="search"
                  type="search"
                  className="bg-transparent"
                  darkMode={true}
                />
              </div>
              <p className="text-teal-200 text-xs py-2 ml-3 mb-1 ">Monitored Assets</p>
                <div className="overflow-y-auto max-h-[420px] scrollbar">

                  <div className="ml-2">
                    <TreeUI data={sampleData} />
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="p-6">
            <UserProfileDesktop />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto rounded-xl">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default Layout;

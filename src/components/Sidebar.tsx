import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiDisc } from "react-icons/fi";
import { LuFactory } from "react-icons/lu";
import { Link } from "react-router-dom";
import { Card } from "./Card";

// Recursive Section Component
function Section({ section }: { section: SectionType }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const getSectionIcon = () => {
    // Customize icons for sections
    if (section.name === "Factory") {
      return <LuFactory className="w-5 h-5 mr-1.5 text-green-500" />;
    }
    return <LuFactory className="w-5 h-5 mr-1.5 text-blue-500" />;
  };

  return (
    <div className="pl-2 mt-5">
      <div
        className="flex items-center cursor-pointer text-slate-50 my-2"
        onClick={toggleOpen}
      >
        {getSectionIcon()}
        <span className="font-medium">{section.name}</span>
      </div>
      {isOpen && (
        <div>
          {section.machines.map((machine) => (
            <Machine key={machine.name} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}

// Machine Component with machine states and routing
function Machine({ machine }: { machine: MachineType }) {
  const getMachineStateIcon = () => {
    switch (machine.state) {
      case "normal":
        return <FiCheckCircle className="w-5 h-5 mr-1.5 text-green-500" />;
      case "alert":
        return <FiAlertTriangle className="w-5 h-5 mr-1.5 text-yellow-400" />;
      case "emergency":
        return <FiXCircle className="w-5 h-5 mr-1.5 text-red-600" />;
      case "offline":
        return <FiDisc className="w-5 h-5 mr-1.5 text-gray-400" />;
      default:
        return null;
    }
  };

  // Define machine-specific routes
  const machineLink = {
    "Machine A": "/machine-a",
    "Machine B": "/machine-b",
    "Machine C": "/machine-c",
    "Machine D": "/machine-d",
    "Machine E": "/machine-e",
  }[machine.name] || "/default-path";

  return (
    <Link to={machineLink} className="flex items-center ml-3 my-2 text-slate-50">
      {getMachineStateIcon()}
      <span>{machine.name}</span>
    </Link>
  );
}

// Types for better structure
type MachineType = {
  name: string;
  state: "normal" | "alert" | "emergency" | "offline";
};

type SectionType = {
  name: string;
  machines: MachineType[];
};

const Sidebar = () => {
  const sections: SectionType[] = [
    {
      name: "Factory",
      machines: [
        { name: "Machine A", state: "normal" },
        { name: "Machine B", state: "alert" },
        { name: "Machine C", state: "emergency" },
      ],
    },
    {
      name: "Warehouse",
      machines: [
        { name: "Machine D", state: "offline" },
        { name: "Machine E", state: "normal" },
      ],
    },
  ];

  return (
    <div className="w-[300px] h-[calc(100vh-64px)] bg-white dark:bg-gray-900 ">
      <Card className="mx-auto bg-slate-900">
        <div>
          {sections.map((section) => (
            <Section key={section.name} section={section} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;

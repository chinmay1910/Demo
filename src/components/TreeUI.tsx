import { useState } from 'react';
import { Rows2, Factory} from 'lucide-react';

// Status color mapping
const statusColors = {
  normal: 'bg-green-400',
  alert: 'bg-amber-300',
  warning: 'bg-rose-400',
  offline: 'bg-slate-400',
};

// Configurable styles
const styles = {
  lineColor: 'border-gray-600',
  lineWidth: 'border-[0.5px]',
  hoverBg: 'hover:bg-slate-800',
  activeBg: 'active:bg-slate-800',
  textColor: 'text-slate-50',
  iconColor: 'text-slate-200',
};

// TreeNode component
const TreeNode = ({ node, level = 0, isLast = false, parentIsOpen = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Function to get appropriate icon based on tree level
  const getIcon = () => {
    switch (level) {
      case 0: return <Factory className={`w-4 h-4 ${styles.iconColor}`} />;
      case 1: return <Rows2 className={`w-4 h-4 ${styles.iconColor}`} />;
      case 2: return (
        <div className={`w-3 h-3 rounded-full ${statusColors[node.status] || 'bg-gray-400'}`}></div>
      );
      default: return null;
    }
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`relative ${level > 0 ? 'ml-4 mr-1' : ''}`}>
      {level > 0 && parentIsOpen && (
        <div 
          className={`absolute ${styles.lineWidth} ${styles.lineColor}`}
          style={{
            left: '-0.75rem',
            top: 0,
            width: '1px',
            height: isLast ? '1.1rem' : '100%'
          }}
        />
      )}
      <div className="relative">
        {level > 0 && (
          <div 
            className={`absolute ${styles.lineWidth} ${styles.lineColor} `}
            style={{
              left: '-0.75rem',
              top: '1.1rem',
              width: '0.75rem',
              height: '1px'
            }}
          />
        )}
         
        <button 
          className={`flex items-center  w-full rounded-lg font-medium px-3 py-2 text-left text-sm cursor-pointer ${styles.hoverBg} ${styles.activeBg} w-full text-left`}
          onClick={toggleOpen}
        >
          <span className="mr-2">{getIcon()}</span>
          <span className={`text-sm ${styles.textColor}`}>{node.name}</span>
        </button>
      </div>
      {isOpen && hasChildren && (
        <div className="ml-4">
          {node.children.map((childNode, index) => (
            <TreeNode 
              key={index} 
              node={childNode} 
              level={level + 1}
              isLast={index === node.children.length - 1}
              parentIsOpen={isOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// SidebarTreeView component
const TreeUI = ({ data }) => {
  return (
    <div>
     
      {data.map((node, index) => (
        <TreeNode 
          key={index} 
          node={node}
          isLast={index === data.length - 1}
        />
      ))}
    </div>
  );
};


// DashboardLayout component (unchanged)
const DashboardLayout = ({ children }) => {
  // Sample data with 3 layers: Factory > Sections > Assets
  const sampleData = [
    {
      name: "Factory A",
      children: [
        {
          name: "Section 1",
          children: [
            { name: "Asset 1.1", status: "normal" },
            { name: "Asset 1.2", status: "alert" },
          ]
        },
        {
          name: "Section 2",
          children: [
            { name: "Asset 2.1", status: "warning" },
            { name: "Asset 2.2", status: "offline" },
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
          ]
        }
      ]
    }
  ];

  return (
    <div className="bg-white p-3 h-screen flex">
      <div className="flex rounded-md h-full w-full overflow-hidden border border-gray-200">
        <div className="w-[250px] min-w-[250px] h-full overflow-y-auto">
          <TreeUI data={sampleData} />
        </div>
        <div className="flex-grow border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeUI;

// // Example usage (unchanged)
// const App = () => {
//   return (
//     <DashboardLayout>
//       <h1 className="text-2xl font-bold mb-4">Vibration Analysis Dashboard</h1>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="bg-blue-100 p-4 rounded-md">Chart 1</div>
//         <div className="bg-green-100 p-4 rounded-md">Chart 2</div>
//         <div className="bg-yellow-100 p-4 rounded-md">Table 1</div>
//         <div className="bg-purple-100 p-4 rounded-md">Table 2</div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default App;
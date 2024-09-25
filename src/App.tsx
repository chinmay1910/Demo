import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Overview from "./components/Overview";
import Assets from "./components/Assets";
import Workorders from "./components/Workorders";
import Inventory from "./components/Inventory";
import Reports from "./Reports";
import MachineA from "./MachineA";
function App() {
  return (
    <Router>
     
      <Routes>
        {/* Render Overview and Assets without the Layout */}
        <Route path="overview" element={<Overview />} />
        <Route path="assets" element={<Assets />} />
        <Route path="workorders" element={<Workorders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="machine-A" element={<MachineA />} />
        {/* Define more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import Overview from "./components/Overview";
import Assets from "./components/Assets";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Layout />}>

          <Route path="overview" element={<Overview />} />
          <Route path="assets" element={<Assets />} />
          {/* Define more routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

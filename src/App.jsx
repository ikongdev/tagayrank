import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import Attendance from "./pages/Attendance";
import History from "./pages/History";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.25),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.22),transparent_32%),linear-gradient(135deg,#fff7ed_0%,#fdebd3_38%,#f8d2a8_100%)]">
        <div className="min-h-screen flex">
          <Sidebar />

          <main className="flex-1 px-3 py-4 pb-28 lg:px-6 lg:py-6 lg:pb-6">
            <div className="glass-card min-h-[88vh] lg:min-h-[92vh] rounded-[28px] lg:rounded-[36px] p-4 md:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
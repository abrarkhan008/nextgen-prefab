import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import History from "./pages/History";
import QuotationEditor from "./pages/QuotationEditor";
import QuotationWorkout from "./pages/QuotationWorkout";
import WorkoutSummary from "./pages/WorkoutSummary";
import MaterialList from "./pages/MaterialList";
import DCEditor from "./pages/DCEditor";
import InvoiceEditor from "./pages/InvoiceEditor";
import PaymentHistory from "./pages/PaymentHistory";
import GstPayment from "./pages/GstPayment";

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/quotation/:id" element={<QuotationEditor />} />
          <Route path="/quotation/:id/workout" element={<QuotationWorkout />} />
          <Route path="/quotation/:id/summary" element={<WorkoutSummary />} />
          <Route path="/quotation/:id/materials" element={<MaterialList />} />
          <Route path="/dc/:id" element={<DCEditor />} />
          <Route path="/invoice/:id" element={<InvoiceEditor />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/gst" element={<GstPayment />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

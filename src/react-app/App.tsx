import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/react-app/contexts/SupabaseAuthContext";
import Layout from "@/react-app/components/Layout";
import HomePage from "@/react-app/pages/Home";
import LoginSupabasePage from "@/react-app/pages/LoginSupabase";
import RegisterSupabasePage from "@/react-app/pages/RegisterSupabase";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import AddPolePage from "@/react-app/pages/AddPole";
import AddPoleBulkPage from "@/react-app/pages/AddPoleBulk";
import EditPolePage from "@/react-app/pages/EditPole";
import MyPolesPage from "@/react-app/pages/MyPoles";
import PoleDetailPage from "@/react-app/pages/PoleDetail";
import ProfilePage from "@/react-app/pages/Profile";
import AboutPage from "@/react-app/pages/About";
import TestSupabase from "@/react-app/pages/TestSupabase";
import TestRoute from "@/react-app/pages/TestRoute";

export default function App() {
  return (
    <SupabaseAuthProvider>
      <Router>
        <Layout>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginSupabasePage />} />
              <Route path="/register" element={<RegisterSupabasePage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/add-pole" element={<AddPolePage />} />
              <Route path="/add-pole-bulk" element={<AddPoleBulkPage />} />
              <Route path="/edit-pole/:id" element={<EditPolePage />} />
              <Route path="/my-poles" element={<MyPolesPage />} />
              <Route path="/poles/:id" element={<PoleDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/test-supabase" element={<TestSupabase />} />
              <Route path="/test-route" element={<TestRoute />} />
            </Routes>
          </Layout>
        </Router>
    </SupabaseAuthProvider>
  );
}

import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:underline"
            >
              ← Back
            </button>

            <h1 className="text-lg font-bold">DWB Construction</h1>
          </div>

          <nav className="flex gap-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-black">
              Dashboard
            </Link>
            <Link to="/clients" className="text-gray-700 hover:text-black">
              Clients
            </Link>

            <button
              onClick={logout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 bg-gray-100">
        {/* 🔑 THIS wrapper is what centers everything */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

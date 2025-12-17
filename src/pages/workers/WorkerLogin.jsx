import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

function WorkerLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/worker/auth/login", {
        name,
        phone,
        employeeCode
      });

      // Assuming response.data contains the token or success message
      if (response.data && response.data.token) {
        localStorage.setItem("workerToken", response.data.token);
        localStorage.setItem("employeeCode", employeeCode);
        localStorage.setItem("employeeName", name);

      } else {
        // Fallback if just success
        localStorage.setItem("workerToken", "authenticated");
        localStorage.setItem("employeeCode", employeeCode);
        localStorage.setItem("employeeName", name);
      }

      alert("Logged in successfully");
      navigate("/worker/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Registration feature coming soon. Please contact admin.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8 space-y-6">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-2 font-semibold rounded-l ${isLogin ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-2 font-semibold rounded-r ${!isLogin ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-indigo-700">Worker Login</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
              <input
                type="text"
                placeholder="Enter your employee code"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          /* Register Form Placeholder */
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Worker Registration</h2>
            <p className="text-gray-600 mb-6">
              Please contact your supervisor or administrator to register as a new worker.
            </p>
            <button
              onClick={() => setIsLogin(true)}
              className="text-indigo-600 hover:underline font-medium"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerLogin;

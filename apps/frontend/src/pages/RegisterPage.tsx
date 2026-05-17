import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "", role: "BUYER" as "BUYER" | "BRAND_OWNER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data.user, data.token);
      navigate(form.role === "BRAND_OWNER" ? "/" : "/");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-serif text-white mb-8 text-center">Create Account</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Account type</label>
          <div className="grid grid-cols-2 gap-3">
            {(["BUYER", "BRAND_OWNER"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`py-2 rounded-lg border text-sm transition-colors ${
                  form.role === role
                    ? "border-gold-500 bg-gold-500/10 text-gold-400"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {role === "BUYER" ? "Buyer" : "Brand / Merchant"}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-gold-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

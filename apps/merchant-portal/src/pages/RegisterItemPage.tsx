import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function RegisterItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ chipId: "", ipfsHash: "", name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/items/register", {
        chipId: form.chipId,
        ipfsHash: form.ipfsHash,
        metadata: { name: form.name, description: form.description },
      });
      navigate("/inventory");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-1">Register Item</h1>
      <p className="text-gray-400 text-sm mb-6">
        Register a physical luxury item and bind it to an NFC/QR chip
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Chip ID *</label>
          <input
            value={form.chipId}
            onChange={(e) => setForm({ ...form, chipId: e.target.value })}
            placeholder="e.g. GU-NFC-2024-001"
            className="input"
            required
          />
          <p className="text-xs text-gray-600 mt-1">Unique ID from the NFC chip or QR code</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">IPFS Hash *</label>
          <input
            value={form.ipfsHash}
            onChange={(e) => setForm({ ...form, ipfsHash: e.target.value })}
            placeholder="Qm..."
            className="input"
            required
          />
          <p className="text-xs text-gray-600 mt-1">Upload images to Pinata first, then paste the CID here</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Item Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Gucci Dionysus Shoulder Bag"
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/inventory")} className="flex-1 border border-gray-700 text-gray-400 py-2 rounded-lg text-sm hover:border-gray-500 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">
            {loading ? "Registering..." : "Register Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

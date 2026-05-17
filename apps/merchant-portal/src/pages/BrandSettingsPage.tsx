import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Rule {
  ruleType: "NFC" | "QR" | "SERIAL" | "HOLOGRAM";
  ruleValue: string;
  active: boolean;
}

interface Brand {
  id: string;
  name: string;
  verified: boolean;
  verificationRules: Rule[];
}

export default function BrandSettingsPage() {
  const qc = useQueryClient();
  const [regForm, setRegForm] = useState({ name: "", logo: "" });
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const { data: brand } = useQuery<Brand>({
    queryKey: ["brand", "me"],
    queryFn: () => api.get("/brands/me").then((r) => r.data).catch(() => null),
  });

  const rulesMutation = useMutation({
    mutationFn: (rules: Rule[]) =>
      api.put(`/brands/${brand!.id}/rules`, { verificationRules: rules }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand", "me"] }),
  });

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      await api.post("/brands/register", regForm);
      qc.invalidateQueries({ queryKey: ["brand", "me"] });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setRegError(e.response?.data?.error ?? "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const addRule = () => {
    if (!brand) return;
    rulesMutation.mutate([
      ...brand.verificationRules,
      { ruleType: "NFC", ruleValue: "", active: true },
    ]);
  };

  const updateRule = (index: number, updates: Partial<Rule>) => {
    if (!brand) return;
    const rules = brand.verificationRules.map((r, i) => (i === index ? { ...r, ...updates } : r));
    rulesMutation.mutate(rules);
  };

  const removeRule = (index: number) => {
    if (!brand) return;
    rulesMutation.mutate(brand.verificationRules.filter((_, i) => i !== index));
  };

  if (!brand) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-1">Register Brand</h1>
        <p className="text-gray-400 text-sm mb-6">Set up your brand profile to get started</p>

        <form onSubmit={handleRegister} className="card space-y-4">
          {regError && <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg">{regError}</div>}

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Brand Name *</label>
            <input
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Logo URL</label>
            <input
              type="url"
              value={regForm.logo}
              onChange={(e) => setRegForm({ ...regForm, logo: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>

          <button type="submit" disabled={regLoading} className="btn-primary w-full">
            {regLoading ? "Registering..." : "Register Brand"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Brand Settings</h1>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-white">{brand.name}</div>
            <div className={`text-xs mt-1 ${brand.verified ? "text-green-400" : "text-yellow-400"}`}>
              {brand.verified ? "✅ Verified" : "⏳ Pending verification"}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-white">Verification Rules</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Define how items from your brand are authenticated
            </p>
          </div>
          <button onClick={addRule} className="btn-primary" disabled={!brand.verified}>
            + Add Rule
          </button>
        </div>

        {!brand.verified && (
          <div className="text-xs text-yellow-400 bg-yellow-950/30 p-3 rounded-lg mb-4">
            Rules can only be added after your brand is verified by TESTF admin.
          </div>
        )}

        {brand.verificationRules.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-6">No verification rules set</div>
        ) : (
          <div className="space-y-3">
            {brand.verificationRules.map((rule, i) => (
              <div key={i} className="border border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                      value={rule.ruleType}
                      onChange={(e) => updateRule(i, { ruleType: e.target.value as Rule["ruleType"] })}
                      className="input text-xs"
                    >
                      {["NFC", "QR", "SERIAL", "HOLOGRAM"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rule Value (JSON)</label>
                    <input
                      value={rule.ruleValue}
                      onChange={(e) => updateRule(i, { ruleValue: e.target.value })}
                      className="input text-xs font-mono"
                      placeholder='{"pattern": "GU-*"}'
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={(e) => updateRule(i, { active: e.target.checked })}
                    />
                    Active
                  </label>
                  <button
                    onClick={() => removeRule(i)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

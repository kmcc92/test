import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface VerifyResponse {
  authentic: boolean;
  item: {
    id: string;
    chipId: string;
    nftTokenId: string | null;
    ipfsHash: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  };
  brand: { name: string; logo: string | null; verified: boolean };
}

export default function VerifyPage() {
  const { chipId: paramChipId } = useParams<{ chipId: string }>();
  const navigate = useNavigate();
  const [inputChipId, setInputChipId] = useState("");

  const chipIdToFetch = paramChipId !== "demo" ? paramChipId : undefined;

  const { data, isLoading, error } = useQuery<VerifyResponse>({
    queryKey: ["verify", chipIdToFetch],
    queryFn: () => api.get(`/items/${chipIdToFetch}/verify`).then((r) => r.data),
    enabled: !!chipIdToFetch,
  });

  const handleSearch = () => {
    if (inputChipId.trim()) navigate(`/verify/${inputChipId.trim()}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-serif text-white mb-2">Verify Authenticity</h1>
      <p className="text-gray-400 mb-8">Enter the NFC chip ID or QR code from your luxury item</p>

      <div className="flex gap-3 mb-8">
        <input
          value={inputChipId}
          onChange={(e) => setInputChipId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. CHIP-001 or scan NFC"
          className="input"
        />
        <button onClick={handleSearch} className="btn-primary whitespace-nowrap">
          Verify
        </button>
      </div>

      {isLoading && (
        <div className="card text-center text-gold-400 animate-pulse py-10">Checking blockchain...</div>
      )}

      {error && (
        <div className="card border-red-800 bg-red-950/30 text-center py-10">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-serif text-red-400 mb-2">Not Found</h2>
          <p className="text-gray-400">This chip ID was not found in the TESTF registry.</p>
        </div>
      )}

      {data && (
        <div className={`card border-2 ${data.authentic ? "border-green-600" : "border-red-600"}`}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{data.authentic ? "✅" : "⚠️"}</div>
            <h2 className={`text-3xl font-serif ${data.authentic ? "text-green-400" : "text-red-400"}`}>
              {data.authentic ? "Authentic" : "Unverified Brand"}
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Brand" value={data.brand.name} />
            <Row label="Chip ID" value={data.item.chipId} mono />
            {data.item.nftTokenId && <Row label="NFT Token ID" value={`#${data.item.nftTokenId}`} mono />}
            <Row label="IPFS Hash" value={data.item.ipfsHash} mono />
            <Row label="Registered" value={new Date(data.item.createdAt).toLocaleDateString()} />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className={`text-white ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

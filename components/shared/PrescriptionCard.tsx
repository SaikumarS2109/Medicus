interface PrescriptionCardProps {
  prescription: any;
  onRefill?: (id: string) => void;
}

export default function PrescriptionCard({ prescription, onRefill }: PrescriptionCardProps) {
  return (
    <div className="card">
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F172A" }}>
            {prescription.medication}
          </div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            {prescription.dosage} · {prescription.frequency}
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            Dr. {prescription.doctor?.name || "Unknown"} · {prescription.refillsRemaining} refill{prescription.refillsRemaining !== 1 ? "s" : ""} remaining
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span className={prescription.status === "active" ? "badge badge-completed" : "badge"} style={prescription.status !== "active" ? { background: "#F1F5F9", color: "#64748B" } : {}}>
            {prescription.status}
          </span>
          {onRefill && prescription.refillsRemaining > 0 && (
            <button onClick={() => onRefill(prescription.id)} className="btn-text" style={{ fontSize: 11 }}>
              Request Refill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

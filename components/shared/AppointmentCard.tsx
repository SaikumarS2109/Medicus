import { formatDate } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  scheduled: "badge badge-scheduled",
  completed:  "badge badge-completed",
  cancelled:  "badge badge-cancelled",
  "no-show":  "badge badge-no-show",
};

interface AppointmentCardProps {
  appointment: any;
  onCancel?: (id: string) => void;
  onEdit?: () => void;
  editLabel?: string;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  onEdit,
  editLabel = "Edit",
}: AppointmentCardProps) {
  const hasVitals =
    appointment.bloodPressure || appointment.heartRate ||
    appointment.temperature || appointment.weight || appointment.oxygenSaturation;

  return (
    <div className="card" style={{ overflow: "visible" }}>
      <div style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F172A" }}>
            {appointment.patient?.user?.name && appointment.doctor?.name
              ? `${appointment.patient.user.name} → Dr. ${appointment.doctor.name}`
              : appointment.patient?.user?.name || appointment.doctor?.name || "Unknown"}
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            {formatDate(appointment.appointmentDate)}
          </div>
          {appointment.reason && (
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
              Reason: {appointment.reason}
            </div>
          )}
          {appointment.notes && (
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3, fontStyle: "italic" }}>
              {appointment.notes}
            </div>
          )}
          {hasVitals && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 6 }}>
              {appointment.bloodPressure && (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>BP: {appointment.bloodPressure}</span>
              )}
              {appointment.heartRate && (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>HR: {appointment.heartRate} bpm</span>
              )}
              {appointment.temperature && (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Temp: {appointment.temperature}°F</span>
              )}
              {appointment.weight && (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Wt: {appointment.weight} kg</span>
              )}
              {appointment.oxygenSaturation && (
                <span style={{ fontSize: 11, color: "#94A3B8" }}>O₂: {appointment.oxygenSaturation}%</span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span className={STATUS_BADGE[appointment.status] ?? "badge"}>
            {appointment.status}
          </span>
          {onEdit && (
            <button onClick={onEdit} className="btn-text" style={{ fontSize: 11 }}>
              {editLabel}
            </button>
          )}
          {onCancel && appointment.status === "scheduled" && (
            <button
              onClick={() => onCancel(appointment.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 11, color: "#DC2626", fontFamily: "inherit", padding: 0,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

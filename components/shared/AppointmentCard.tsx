import { Appointment } from "@prisma/client";
import { formatDate } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: Appointment & { doctor?: any };
  onCancel?: (id: string) => void;
}

export default function AppointmentCard({
  appointment,
  onCancel,
}: AppointmentCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">
            {appointment.doctor?.name || "Dr. Unknown"}
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(appointment.appointmentDate)}
          </p>
          <p className="text-sm text-gray-600">
            Reason: {appointment.reason || "General checkup"}
          </p>
          {appointment.notes && (
            <p className="text-sm text-gray-500 mt-2">Notes: {appointment.notes}</p>
          )}
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              appointment.status === "scheduled"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {appointment.status}
          </span>
          {onCancel && appointment.status === "scheduled" && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="text-xs text-red-600 hover:underline ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

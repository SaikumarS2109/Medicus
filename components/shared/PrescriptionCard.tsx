interface PrescriptionCardProps {
  prescription: any;
  onRefill?: (id: string) => void;
}

export default function PrescriptionCard({
  prescription,
  onRefill,
}: PrescriptionCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{prescription.medication}</h3>
          <p className="text-sm text-gray-600">Dosage: {prescription.dosage}</p>
          <p className="text-sm text-gray-600">
            Frequency: {prescription.frequency}
          </p>
          <p className="text-sm text-gray-600">
            Prescribed by: {prescription.doctor?.name || "Unknown"}
          </p>
          <p className="text-sm text-gray-600">
            Refills remaining: {prescription.refillsRemaining}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              prescription.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {prescription.status}
          </span>
          {onRefill && prescription.refillsRemaining > 0 && (
            <button
              onClick={() => onRefill(prescription.id)}
              className="text-xs text-blue-600 hover:underline ml-2"
            >
              Request Refill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

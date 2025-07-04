import api from "@/services/api";
import { AlertTriangle, Coffee, Flame, Snowflake } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TypeConfirmationModal from "./type-confirmation-modal";

const TemperatureSelector = ({
  lead,
  fetchLeadDetails,
}: {
  lead: any;
  fetchLeadDetails: any;
}) => {
  const [selectedTemperature, setSelectedTemperature] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (temperature: any) => {
    setSelectedTemperature(temperature);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    console.log(`Confirmed selection: ${selectedTemperature}`); // Replace this with your function call
    api
      .post("/update-lead-type", {
        leadId: lead.id,
        newType: selectedTemperature,
      })
      .then(() => {
        toast.success(`Lead updated to ${selectedTemperature}`);
        fetchLeadDetails();
      })
      .catch((error) => {
        toast.error("Error updating lead");
        console.error("Error updating lead", error);
      });

    setModalOpen(false);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-2.5">
          {[
            {
              icon: AlertTriangle,
              label: "lost",
              value: "lost",
              color: "text-gray-400",
              activeColor: "text-yellow-600",
            },
            {
              icon: Snowflake,
              label: "cold",
              value: "cold",
              color: "text-gray-400",
              activeColor: "text-blue-600",
            },
            {
              icon: Coffee,
              label: "warm",
              value: "warm",
              color: "text-gray-400",
              activeColor: "text-orange-600",
            },
            {
              icon: Flame,
              label: "hot",
              value: "hot",
              color: "text-gray-400",
              activeColor: "text-red-600",
            },
          ].map(({ icon: Icon, label, value, color, activeColor }) => {
            const isActive = lead?.type === value;
            return (
              <label
                key={value}
                className="flex flex-col items-center justify-center cursor-pointer"
                onClick={() => handleOpenModal(value)}
              >
                <input
                  type="radio"
                  name="temperature"
                  value={value}
                  className="hidden"
                />
                <Icon
                  className={`${isActive ? activeColor : color} w-8 h-8 mb-2`}
                />
                <span
                  className={`text-center text-xs ${
                    isActive ? activeColor : color
                  }`}
                >
                  {label}
                </span>
              </label>
            );
          })}
        </div>
        <TypeConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          text="The following task will change the Type of Profile."
        />
      </div>
    </>
  );
};

export default TemperatureSelector;

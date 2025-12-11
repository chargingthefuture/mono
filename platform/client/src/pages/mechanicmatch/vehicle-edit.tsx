import MechanicMatchVehicleForm from "./vehicle-form";
import { useRoute } from "wouter";

export default function MechanicMatchVehicleEdit() {
  const [, params] = useRoute("/apps/mechanicmatch/vehicles/:id/edit");
  const vehicleId = params?.id;

  return <MechanicMatchVehicleForm mode="edit" vehicleId={vehicleId} />;
}


import VehicleTable from '@/components/parking/VehicleTable';

export default function VehiclesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Ma flotte</h1>
      <VehicleTable />
    </div>
  );
}

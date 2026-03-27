import { getParkingById, updateParkingInfo } from "@/services/Parcking-api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditParkingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const searchParamsResolved = await searchParams;
  const error = searchParamsResolved?.error;

  const parking = await getParkingById(id);

  if (!parking) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Parking introuvable</h2>
        <Link
          href="/dashboard/admin/parkings"
          className="mt-6 inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  // Récupérer l'ID du parking avant la fonction server action
  const parkingId = parking.id;

  async function updateParking(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const capacity = parseInt(formData.get("capacity") as string);
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const description = formData.get("description") as string;

    const success = await updateParkingInfo(parkingId, {
      name,
      address,
      city,
      capacity,
      email,
      phone,
      description,
    });

    if (success) {
      revalidatePath(`/dashboard/admin/parkings/${parkingId}`);
      redirect(`/dashboard/admin/parkings/${parkingId}`);
    } else {
      redirect(`/dashboard/admin/parkings/${parkingId}/edit?error=1`);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link
          href={`/dashboard/admin/parkings/${parking.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition"
        >
          <ArrowLeft size={18} /> Retour au détail
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Modifier le parking</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
        <form action={updateParking} className="space-y-6">
          {/* Affichage de l'erreur */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Erreur lors de la mise à jour. Vérifiez votre connexion ou réessayez.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du parking *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={parking.name}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacité (places) *
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                defaultValue={parking.capacity}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={parking.address}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={parking.city || ""}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={parking.email || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={parking.phone || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={parking.description || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href={`/dashboard/admin/parkings/${parking.id}`}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Save size={18} /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mobility-mali.com'

  // Vous pouvez ajouter ici la récupération dynamique des annonces de véhicules depuis votre BD (Prisma)
  // const vehicles = await prisma.vehicle.findMany()

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Ajoutez vos autres routes statiques ou dynamiques
  ]
}
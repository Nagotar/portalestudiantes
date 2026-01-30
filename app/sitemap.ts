import { MetadataRoute } from 'next'
import { db } from '@/lib/db-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.adam.cl'

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Obtener cursos activos para el sitemap
    const coursesResult = await db.execute({
      sql: 'SELECT id, title, updated_at FROM courses WHERE active = 1',
      args: []
    })

    const coursePages: MetadataRoute.Sitemap = coursesResult.rows.map((course: any) => ({
      url: `${baseUrl}/cursos/${course.id}`,
      lastModified: new Date(course.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Obtener documentos activos
    const documentsResult = await db.execute({
      sql: 'SELECT id, title, updated_at FROM documents WHERE active = 1',
      args: []
    })

    const documentPages: MetadataRoute.Sitemap = documentsResult.rows.map((doc: any) => ({
      url: `${baseUrl}/documentos/${doc.id}`,
      lastModified: new Date(doc.updated_at || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...coursePages, ...documentPages]
  } catch (error) {
    console.error('Error generando sitemap:', error)
    return staticPages
  }
}

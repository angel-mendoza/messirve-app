import { ServiceExplorer } from '@/components/service-explorer'
import { useLocalSearchParams } from 'expo-router'

export default function ServicesByCategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()

  return <ServiceExplorer mode="category" initialCategorySlug={slug ?? null} />
}

import { ServiceExplorer } from '@/components/service-explorer'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>()
  const { user } = useAuth()
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setFirstName(data?.full_name?.trim().split(' ')[0] ?? '')
      })
  }, [user])

  return <ServiceExplorer mode="search" greetingName={firstName} initialQuery={q ?? ''} />
}

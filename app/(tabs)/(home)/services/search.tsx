import { ServiceExplorer } from '@/components/service-explorer'
// FULL_NAME_DISABLED: el cliente pidió quitar el nombre (2026-10-16)
// import { useAuth } from '@/lib/auth-context'
// import { supabase } from '@/lib/supabase'
import { useLocalSearchParams } from 'expo-router'
// FULL_NAME_DISABLED: import { useEffect, useState } from 'react'

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>()
  // FULL_NAME_DISABLED
  // const { user } = useAuth()
  // const [firstName, setFirstName] = useState('')
  //
  // useEffect(() => {
  //   if (!user) return
  //   supabase
  //     .from('profiles')
  //     .select('full_name')
  //     .eq('id', user.id)
  //     .single()
  //     .then(({ data }) => {
  //       setFirstName(data?.full_name?.trim().split(' ')[0] ?? '')
  //     })
  // }, [user])

  // FULL_NAME_DISABLED: return <ServiceExplorer mode="search" greetingName={firstName} initialQuery={q ?? ''} />
  return <ServiceExplorer mode="search" initialQuery={q ?? ''} />
}

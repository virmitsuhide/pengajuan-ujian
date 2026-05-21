'use client'

import { useEffect } from 'react'
import { markSubmissionsSeen } from '@/lib/actions/notifications'

// Komponen tak kasat mata — fire server action saat halaman Kelola dibuka
export function MarkSeen() {
  useEffect(() => {
    markSubmissionsSeen()
  }, [])
  return null
}

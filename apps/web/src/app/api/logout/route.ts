import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = cookies()
  
  // Natively destroy the edge session cookies from the same origin 
  // bypassing any cross-origin domain constraints!
  cookieStore.delete('jwt')
  cookieStore.delete('deviceToken')
  
  return NextResponse.json({ success: true, message: 'Local session shredded' })
}

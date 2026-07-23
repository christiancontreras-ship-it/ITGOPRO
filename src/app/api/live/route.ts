import { NextResponse } from 'next/server'
import { platformStatus } from '@/lib/operations/health'

export const dynamic = 'force-dynamic'
export function GET() {
  return NextResponse.json(platformStatus())
}

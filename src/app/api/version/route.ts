import { NextResponse } from 'next/server'
import { appConfig } from '@/config/app'

export function GET() {
  return NextResponse.json({ version: appConfig.version })
}

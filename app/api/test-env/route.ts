import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    serverEnv: {
      NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_SINGBOX_TRANSFER,
      NEXT_PUBLIC_ENABLE_LOON_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_LOON_TRANSFER,
      NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_META_TRANSFER,
      NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER: process.env.NEXT_PUBLIC_ENABLE_CLASH_PREMIUM_TRANSFER,
    },
    allEnvKeys: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')),
  });
}

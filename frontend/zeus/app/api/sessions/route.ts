// proxy to django sessions
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';

  const res = await fetch(
    'http://localhost:8000/api/session/', // Django endpoint
    {
      headers: { cookie },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

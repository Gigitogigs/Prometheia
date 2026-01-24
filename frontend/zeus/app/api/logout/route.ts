// proxy to django logout
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';

  await fetch('http://localhost:8000/accounts/logout/', {
    method: 'POST',
    headers: {
      cookie,
    },
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';

const SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || '';

export async function GET() {
  try {
    if (!SCRIPT_URL) {
      return NextResponse.json({ ok: false, error: 'Falta APPS_SCRIPT_URL' }, { status: 500 });
    }

    const separator = SCRIPT_URL.includes('?') ? '&' : '?';
    const url = `${SCRIPT_URL}${separator}token=${encodeURIComponent(SCRIPT_TOKEN)}`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!SCRIPT_URL) {
      return NextResponse.json({ ok: false, error: 'Falta APPS_SCRIPT_URL' }, { status: 500 });
    }

    const body = await request.json();
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, token: SCRIPT_TOKEN })
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
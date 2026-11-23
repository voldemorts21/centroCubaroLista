import { NextResponse } from 'next/server';

const SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || '';

export async function GET() {
  try {
    if (!SCRIPT_URL) {
      return NextResponse.json({ ok: false, error: 'Falta APPS_SCRIPT_URL en variables de entorno' }, { status: 500 });
    }

    const separator = SCRIPT_URL.includes('?') ? '&' : '?';
    const url = `${SCRIPT_URL}${separator}token=${encodeURIComponent(SCRIPT_TOKEN)}`;

    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Apps Script no devolvió JSON válido. Verifica que la URL termine en /exec y que el acceso sea "Cualquier usuario".',
          detalle: rawText.slice(0, 200)
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: data.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!SCRIPT_URL) {
      return NextResponse.json({ ok: false, error: 'Falta APPS_SCRIPT_URL en variables de entorno' }, { status: 500 });
    }

    const body = await request.json();
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, token: SCRIPT_TOKEN })
    });

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Apps Script no devolvió JSON válido en POST. Revisa la implementación /exec.',
          detalle: rawText.slice(0, 200)
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: data.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

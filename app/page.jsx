'use client';

import { useEffect, useMemo, useState } from 'react';

export default function DirectorioChequesPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // Modal de entrega / registro de número de cheque y OK
  const [modalEntrega, setModalEntrega] = useState(null);
  const [chequeInput, setChequeInput] = useState('');
  const [dniInput, setDniInput] = useState('');
  const [estadoInput, setEstadoInput] = useState('OK');
  const [guardando, setGuardando] = useState(false);

  // Modal de nuevo registro
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({
    numero: '',
    requerimiento: '',
    proveedor: '',
    cheque: '',
    importe: '',
    autorizadoGasto: '',
    dni: '',
    estadoOk: 'PENDIENTE'
  });

  const cargarRegistros = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cheques', { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Error al obtener registros');
      setRegistros(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const esOk = (val) => String(val || '').trim().toUpperCase() === 'OK';

  const stats = useMemo(() => {
    const total = registros.length;
    const entregados = registros.filter((r) => esOk(r.estadoOk)).length;
    return { total, entregados, pendientes: total - entregados };
  }, [registros]);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return registros.filter((item) => {
      const okItem = esOk(item.estadoOk);
      const pasaEstado =
        filtroEstado === 'TODOS' ||
        (filtroEstado === 'OK' && okItem) ||
        (filtroEstado === 'PENDIENTE' && !okItem);

      const texto = [
        item.numero,
        item.requerimiento,
        item.proveedor,
        item.cheque,
        item.importe,
        item.autorizadoGasto,
        item.dni,
        item.estadoOk
      ]
        .join(' ')
        .toLowerCase();

      return pasaEstado && texto.includes(q);
    });
  }, [registros, busqueda, filtroEstado]);

  const abrirEntrega = (item) => {
    setModalEntrega(item);
    setChequeInput(item.cheque || '');
    setDniInput(item.dni || '');
    setEstadoInput('OK');
  };

  const guardarEntrega = async (e) => {
    e.preventDefault();
    if (!modalEntrega) return;

    if (estadoInput === 'OK' && !chequeInput.trim()) {
      alert('Ingresa el número de cheque antes de registrar la entrega.');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch('/api/cheques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'marcarEntrega',
          fila: modalEntrega.fila,
          cheque: chequeInput.trim(),
          dni: dniInput.trim(),
          estadoOk: estadoInput
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Error al actualizar');
      setModalEntrega(null);
      await cargarRegistros();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const crearRegistro = async (e) => {
    e.preventDefault();
    if (!nuevoForm.proveedor.trim() && !nuevoForm.cheque.trim()) {
      alert('Ingresa al menos el Proveedor o el Número de Cheque.');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch('/api/cheques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'agregarRegistro',
          ...nuevoForm
        })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Error al guardar');
      setModalNuevo(false);
      setNuevoForm({
        numero: '',
        requerimiento: '',
        proveedor: '',
        cheque: '',
        importe: '',
        autorizadoGasto: '',
        dni: '',
        estadoOk: 'PENDIENTE'
      });
      await cargarRegistros();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <header style={{ background: '#1e3a8a', color: '#fff', padding: '18px 0', marginBottom: 20 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Directorio Web de Entrega de Cheques</h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#dbeafe' }}>
              N° · Requerimiento · Proveedor · N° Cheque · Importe · Autorizado de Gasto N° · DNI · OK
            </p>
          </div>
          <button
            onClick={() => setModalNuevo(true)}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            + Nuevo Cheque
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px 40px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8, borderLeft: '4px solid #1e3a8a' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TOTAL REGISTROS</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8, borderLeft: '4px solid #15803d' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>ENTREGADOS (OK)</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.entregados}</div>
          </div>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8, borderLeft: '4px solid #b45309' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>PENDIENTES</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.pendientes}</div>
          </div>
        </section>

        <section style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar proveedor, N° cheque, requerimiento, AG N° o DNI..."
            style={{ flex: 1, minWidth: 240, padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="OK">Solo Entregados (OK)</option>
          </select>
          <button
            onClick={cargarRegistros}
            style={{ padding: '10px 14px', borderRadius: 6, border: 'none', background: '#e2e8f0', fontWeight: 600, cursor: 'pointer' }}
          >
            Actualizar
          </button>
        </section>

        {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando registros...</p>}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {filtrados.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>No hay resultados.</p>
            ) : (
              filtrados.map((item) => {
                const entregado = esOk(item.estadoOk);
                return (
                  <article
                    key={item.fila}
                    style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 10 }}>
                        <strong style={{ color: '#1e3a8a', fontSize: '1.05rem' }}>Cheque N° {item.cheque || 'S/N'}</strong>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: entregado ? '#dcfce7' : '#fef3c7',
                            color: entregado ? '#166534' : '#92400e'
                          }}
                        >
                          {entregado ? 'OK' : 'PENDIENTE'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>{item.proveedor || 'SIN PROVEEDOR'}</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', fontSize: 14, color: '#334155' }}>
                        <li><strong>N°:</strong> {item.numero || '-'} | <strong>Req.:</strong> {item.requerimiento || '-'}</li>
                        <li><strong>Autorizado de Gasto N°:</strong> {item.autorizadoGasto || '-'}</li>
                        <li><strong>DNI:</strong> {item.dni || '-'}</li>
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>S/ {item.importe || '0.00'}</div>
                      <button
                        onClick={() => abrirEntrega(item)}
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          borderRadius: 6,
                          border: 'none',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: entregado ? '#e2e8f0' : '#15803d',
                          color: entregado ? '#1e293b' : '#fff'
                        }}
                      >
                        {entregado ? 'Ver / Editar Cheque y Estado' : 'Registrar Entrega (OK)'}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}
      </main>

      {modalEntrega && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <form onSubmit={guardarEntrega} style={{ background: '#fff', borderRadius: 10, padding: 20, width: '100%', maxWidth: 440 }}>
            <h3 style={{ marginTop: 0 }}>Registrar Entrega y N° de Cheque</h3>
            <p style={{ background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 14, marginTop: 0 }}>
              <strong>Proveedor:</strong> {modalEntrega.proveedor || 'SIN PROVEEDOR'}<br />
              <strong>Req.: {modalEntrega.numero || '-'}</strong> {modalEntrega.requerimiento || '-'} | <strong>Importe:</strong> S/ {modalEntrega.importe || '0.00'}
            </p>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Número de Cheque *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej. 00001459"
              value={chequeInput}
              onChange={(e) => setChequeInput(e.target.value)}
              style={{ width: '100%', padding: 9, margin: '5px 0 12px', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: 15 }}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>DNI del Receptor</label>
            <input
              type="text"
              placeholder="Ej. 41258963"
              value={dniInput}
              onChange={(e) => setDniInput(e.target.value)}
              style={{ width: '100%', padding: 9, margin: '5px 0 12px', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Estado</label>
            <select
              value={estadoInput}
              onChange={(e) => setEstadoInput(e.target.value)}
              style={{ width: '100%', padding: 9, margin: '5px 0 16px', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            >
              <option value="OK">OK</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setModalEntrega(null)}
                style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#e2e8f0', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#15803d', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                {guardando ? 'Guardando...' : 'Confirmar y Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalNuevo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <form onSubmit={crearRegistro} style={{ background: '#fff', borderRadius: 10, padding: 20, width: '100%', maxWidth: 480 }}>
            <h3 style={{ marginTop: 0 }}>Registrar Nuevo Cheque</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>N°</label>
                <input type="text" value={nuevoForm.numero} onChange={(e) => setNuevoForm({ ...nuevoForm, numero: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Requerimiento</label>
                <input type="text" value={nuevoForm.requerimiento} onChange={(e) => setNuevoForm({ ...nuevoForm, requerimiento: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Proveedor</label>
                <input type="text" value={nuevoForm.proveedor} onChange={(e) => setNuevoForm({ ...nuevoForm, proveedor: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Número de Cheque</label>
                <input type="text" value={nuevoForm.cheque} onChange={(e) => setNuevoForm({ ...nuevoForm, cheque: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Importe</label>
                <input type="number" step="0.01" value={nuevoForm.importe} onChange={(e) => setNuevoForm({ ...nuevoForm, importe: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Autorizado de Gasto N°</label>
                <input type="text" value={nuevoForm.autorizadoGasto} onChange={(e) => setNuevoForm({ ...nuevoForm, autorizadoGasto: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>DNI</label>
                <input type="text" value={nuevoForm.dni} onChange={(e) => setNuevoForm({ ...nuevoForm, dni: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>OK</label>
                <select value={nuevoForm.estadoOk} onChange={(e) => setNuevoForm({ ...nuevoForm, estadoOk: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="OK">OK</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button type="button" onClick={() => setModalNuevo(false)} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#e2e8f0', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" disabled={guardando} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

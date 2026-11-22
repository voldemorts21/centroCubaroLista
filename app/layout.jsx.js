export const metadata = {
  title: 'Directorio Web de Entrega de Cheques',
  description: 'Consulta y control de entrega de cheques conectado a Google Sheets'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f1f5f9', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
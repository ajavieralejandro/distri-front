import { Link } from 'react-router-dom';

export function ConnectionNavLink() {
  return (
    <Link
      to="/conexion"
      className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-50"
    >
      Conexión
    </Link>
  );
}

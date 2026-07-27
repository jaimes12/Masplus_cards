import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Masplus Cards</h1>
        <p className="text-muted-foreground">Tarjetas de fidelidad para Apple Wallet y wallet web.</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/empresa/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Ingresar como empresa
        </Link>
        <Link to="/admin/login" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
          Ingresar como admin
        </Link>
      </div>
    </div>
  )
}

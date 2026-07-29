/// Fondo naranja con formas orgánicas borrosas para las pantallas de login.
export default function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700">
      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute -right-24 top-10 h-72 w-[28rem] rotate-12 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="absolute left-1/3 top-1/4 h-40 w-72 -rotate-[24deg] rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-[-10rem] left-1/4 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-16 right-[-6rem] h-80 w-80 rounded-full bg-orange-800/30 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-24 w-64 rotate-45 rounded-full bg-white/10 blur-2xl" />
    </div>
  )
}

import bg from '../assets/bg-naranja-blanco.webp'

/// Fondo naranja/blanco de marca para las pantallas de login/registro.
export default function AuthBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
      aria-hidden="true"
    />
  )
}

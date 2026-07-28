/// Marco de celular simple (CSS puro) para mostrar el preview de la tarjeta como se vería en un teléfono.
export default function PhoneFrame({ children }) {
  return (
    <div className="relative mx-auto w-[260px] rounded-[2.25rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-xl">
      <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-xl bg-zinc-900" />
      <div className="min-h-[420px] overflow-hidden rounded-[1.75rem] bg-background p-3">{children}</div>
    </div>
  )
}

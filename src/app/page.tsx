import dynamic from 'next/dynamic'

const Game = dynamic(() => import('./components/game').then(mod => mod.Game), { ssr: false })

export default function Home() {
  return (
    <main className="w-full h-screen">
      <Game />
    </main>
  )
}

import { Scene } from './components/Scene'

export default function Home() {
  console.log('Rendering Home page')
  
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <Scene />
    </main>
  )
}

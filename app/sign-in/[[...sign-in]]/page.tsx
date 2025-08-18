import { SignIn } from '@clerk/nextjs'

export default function page() {
  return (
  <main className='flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-orange-800'>
    <SignIn/>
    </main>
  )
}


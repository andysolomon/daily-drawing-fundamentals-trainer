import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">IdeaBrowser Concept</p>
      <h1 className="text-4xl font-semibold">Daily Drawing Fundamentals Trainer</h1>
      <p className="text-base text-muted-foreground">
        Learn-to-draw app with AI feedback on every sketch. This scaffold is prepared for
        implementation with Next.js, Convex, Clerk, TanStack Query/Router, and Playwright/Jest.
      </p>
      <div className="flex gap-3">
        <Button>Start Lesson</Button>
        <Button variant="outline">View Plan</Button>
      </div>
    </main>
  )
}

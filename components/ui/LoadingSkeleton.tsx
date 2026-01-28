import { Loader2 } from 'lucide-react';

export function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* SIDEBAR SKELETON */}
      <div className="w-64 bg-card border-r border-border p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER SKELETON */}
        <div className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted rounded-lg w-48 animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              <div className="h-8 bg-muted rounded-lg w-32 animate-pulse" />
            </div>
          </div>
        </div>

        {/* CONTENT SKELETON */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              
              {/* PROFILE CARD SKELETON */}
              <aside className="space-y-6">
                <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                  <div className="w-32 h-32 mx-auto rounded-full bg-muted animate-pulse" />
                  <div className="mt-4 h-6 bg-muted rounded-lg w-32 mx-auto animate-pulse" />
                  <div className="mt-2 h-4 bg-muted rounded-lg w-20 mx-auto animate-pulse" />
                  
                  <div className="mt-8 p-4 bg-muted/50 rounded-2xl border border-border">
                    <div className="h-4 bg-muted rounded w-24 mx-auto animate-pulse" />
                    <div className="mt-2 h-8 bg-muted rounded w-16 mx-auto animate-pulse" />
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              </aside>

              {/* PROFILE FORM SKELETON */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <div className="h-8 bg-muted rounded-lg w-48 animate-pulse" />
                    <div className="mt-2 h-4 bg-muted rounded-lg w-64 animate-pulse" />
                  </div>
                  <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-12 bg-muted rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

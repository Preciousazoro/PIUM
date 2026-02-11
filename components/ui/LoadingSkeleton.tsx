import { Loader2 } from 'lucide-react';

// Profile Skeleton (already exists)
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

// User Dashboard Skeleton (for dashboard, tasks, etc.)
export function UserDashboardSkeleton() {
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
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse mb-2" />
                  <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-muted rounded w-32 animate-pulse mb-4" />
              <div className="grid gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                      <div className="h-8 bg-muted rounded w-20 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Admin Dashboard Skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* SIDEBAR SKELETON */}
      <div className="w-64 bg-card border-r border-border p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
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
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse mb-2" />
                  <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-muted rounded w-32 animate-pulse mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {[...Array(5)].map((_, i) => (
                        <th key={i} className="text-left p-4">
                          <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(8)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {[...Array(5)].map((_, j) => (
                          <td key={j} className="p-4">
                            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Auth Pages Skeleton
export function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Logo/Title Skeleton */}
          <div className="text-center mb-8">
            <div className="h-12 w-12 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-8 bg-muted rounded w-32 mx-auto animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 mx-auto mt-2 animate-pulse" />
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-12 bg-muted rounded-lg animate-pulse" />
              </div>
            ))}
            
            {/* Button Skeleton */}
            <div className="h-12 bg-muted rounded-lg animate-pulse mt-6" />
            
            {/* Link Skeleton */}
            <div className="h-4 bg-muted rounded w-32 mx-auto animate-pulse mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Static Pages Skeleton (About, Contact, etc.)
export function StaticPageSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header Skeleton */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded-lg w-32 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-8 bg-muted rounded-lg w-20 animate-pulse" />
            <div className="h-8 bg-muted rounded-lg w-20 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="text-center">
            <div className="h-12 bg-muted rounded w-64 mx-auto animate-pulse" />
            <div className="h-6 bg-muted rounded w-96 mx-auto mt-4 animate-pulse" />
          </div>

          {/* Content Sections */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Homepage Skeleton
export function HomepageSkeleton() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden transition-colors duration-300">
      {/* Header Skeleton */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded-lg w-32 animate-pulse" />
          <nav className="hidden md:flex items-center gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded w-16 animate-pulse" />
            ))}
          </nav>
          <div className="h-10 bg-muted rounded-lg w-24 animate-pulse" />
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="h-16 bg-muted rounded w-3/4 mx-auto animate-pulse" />
          <div className="h-8 bg-muted rounded w-1/2 mx-auto mt-4 animate-pulse" />
          <div className="h-12 bg-muted rounded w-48 mx-auto mt-8 animate-pulse" />
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="container mx-auto px-6 py-20">
        <div className="h-12 bg-muted rounded w-48 mx-auto animate-pulse mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 bg-muted rounded-lg animate-pulse mb-4" />
              <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

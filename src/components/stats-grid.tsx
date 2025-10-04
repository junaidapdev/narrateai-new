import { Mic, FileText, TrendingUp, Clock } from "lucide-react"

const stats = [
  {
    label: "Total Recordings",
    value: "0",
    subtext: "recordings created",
    icon: Mic,
  },
  {
    label: "Posts Generated", 
    value: "0",
    subtext: "ready to publish",
    icon: FileText,
  },
  {
    label: "Time Saved",
    value: "0h", 
    subtext: "vs manual writing",
    icon: Clock,
  },
  {
    label: "This Month",
    value: "0",
    subtext: "new recordings", 
    icon: TrendingUp,
  },
]

export function StatsGrid({ recordings, posts }: { recordings: any[], posts: any[] }) {
  const totalRecordings = recordings.length;
  const completedRecordings = recordings.filter(r => r.status === 'completed').length;
  const thisMonthRecordings = recordings.filter(r => {
    const createdAt = new Date(r.created_at);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && 
           createdAt.getFullYear() === now.getFullYear();
  }).length;

  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;

  // Calculate time saved: estimate 30 minutes saved per post vs manual writing
  const timeSavedHours = Math.round((totalPosts * 30) / 60);

  const dynamicStats = [
    {
      label: "Total Recordings",
      value: totalRecordings.toString(),
      subtext: `${completedRecordings} completed`,
      icon: Mic,
    },
    {
      label: "Posts Generated",
      value: totalPosts.toString(),
      subtext: `${publishedPosts} published`,
      icon: FileText,
    },
    {
      label: "Time Saved",
      value: `${timeSavedHours}h`,
      subtext: "vs manual writing",
      icon: Clock,
    },
    {
      label: "This Month",
      value: thisMonthRecordings.toString(),
      subtext: "new recordings",
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* Desktop View - 4 columns */}
      <div className="hidden lg:grid gap-4 grid-cols-4">
        {dynamicStats.map((stat, index) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Icon */}
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground transition-colors group-hover:bg-accent">
              <stat.icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="font-serif text-2xl font-medium tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View - 2 combined cards */}
      <div className="lg:hidden grid gap-4 grid-cols-2">
        {/* First Mobile Card - Recordings & Posts */}
        <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm animate-scale-in">
          <div className="space-y-4">
            {/* Recordings */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
                <Mic className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Recordings</p>
                <p className="font-serif text-xl font-medium tracking-tight">{totalRecordings}</p>
                <p className="text-xs text-muted-foreground">{completedRecordings} completed</p>
              </div>
            </div>
            
            {/* Posts */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Posts</p>
                <p className="font-serif text-xl font-medium tracking-tight">{totalPosts}</p>
                <p className="text-xs text-muted-foreground">{publishedPosts} published</p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Mobile Card - Time Saved & This Month */}
        <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm animate-scale-in">
          <div className="space-y-4">
            {/* Time Saved */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Time Saved</p>
                <p className="font-serif text-xl font-medium tracking-tight">{timeSavedHours}h</p>
                <p className="text-xs text-muted-foreground">vs manual writing</p>
              </div>
            </div>
            
            {/* This Month */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">This Month</p>
                <p className="font-serif text-xl font-medium tracking-tight">{thisMonthRecordings}</p>
                <p className="text-xs text-muted-foreground">new recordings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
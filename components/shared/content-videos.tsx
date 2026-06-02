import { Play, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { CONTENT } from '@/lib/i18n/pt-br'

export function ContentVideos() {
  const { videos } = CONTENT

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-20">
      <div className="flex items-center gap-2">
        <Video className="text-primary size-5" aria-hidden="true" />
        <h3>{videos.title}</h3>
      </div>

      {/* Cards de vídeo são placeholders — sem fotos de pessoas; trocar por embeds reais quando houver vídeo. */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {videos.items.map((video) => (
          <div
            key={video.title}
            className="from-primary to-chart-3 relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br shadow-sm"
          >
            <Badge className="absolute top-3 left-3 gap-1">
              <Video className="size-3" aria-hidden="true" />
              Vídeo
            </Badge>
            <span className="bg-card/90 text-primary flex size-16 items-center justify-center rounded-full shadow-md">
              <Play className="size-7 translate-x-0.5" aria-hidden="true" />
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
              <span className="font-medium">{video.title}</span>
              <span className="shrink-0 text-sm tabular-nums">
                {video.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export type Level = 'inicial' | 'intermedio' | 'avanzado'

export interface Step {
  id: string
  name: string
  description: string
  tips?: string[]
  videoUrl?: string
}

export interface CourseLevel {
  level: Level
  description: string
  steps: Step[]
}

export interface Genre {
  id: string
  name: string
  emoji: string
  tagline: string
  origin: string
  tempo: string
  levels: CourseLevel[]
}

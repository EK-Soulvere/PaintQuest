import type { Database, Json } from '@/lib/types/database.types'

type Task = Database['public']['Tables']['task']['Row']
type Attempt = Database['public']['Tables']['attempt']['Row']
type RecommendationConfig = Database['public']['Tables']['recommendation_config']['Row']
type Profile = Database['public']['Tables']['profile']['Row']
type ArsenalItem = Database['public']['Tables']['arsenal_item']['Row']

export interface RecommendationResult {
    task: Task
    score: number
    reasons: string[]
}

export interface RecommendationInput {
    tasks: Task[]
    attempts: Attempt[]
    availableMinutes: number
    config?: RecommendationConfig | null
    profile?: Profile | null
    arsenal?: ArsenalItem[]
}

function normalizeTags(tags: Json | null): string[] {
    if (!tags) return []
    if (Array.isArray(tags)) return tags.map(String)
    return []
}

function daysSince(dateIso: string, now = new Date()): number {
    const date = new Date(dateIso)
    const diffMs = now.getTime() - date.getTime()
    return diffMs / (1000 * 60 * 60 * 24)
}

function timeFitScore(min: number | null, max: number | null, available: number): number {
    if (min == null && max == null) return 0.5
    const lower = min ?? 0
    const upper = max ?? lower
    if (available >= lower && available <= upper) return 1
    if (available < lower) {
        const delta = lower - available
        return Math.max(0, 1 - delta / Math.max(lower, 1))
    }
    const delta = available - upper
    return Math.max(0, 1 - delta / Math.max(upper, 1))
}

function priorityScore(priority: number): number {
    return Math.max(0, Math.min(1, priority / 5))
}

function skillMatchScore(taskSkills: string[], focusSkills: string[]): number {
    if (taskSkills.length === 0 || focusSkills.length === 0) return 0
    const matches = taskSkills.filter((tag) => focusSkills.includes(tag))
    return matches.length / Math.max(taskSkills.length, 1)
}

function energyFitScore(availableMinutes: number, preference: string | null): number {
    if (!preference) return 0
    if (preference === 'low') {
        return availableMinutes <= 30 ? 1 : 0
    }
    if (preference === 'med') {
        return availableMinutes > 30 && availableMinutes <= 60 ? 1 : 0
    }
    if (preference === 'high') {
        return availableMinutes > 60 ? 1 : 0
    }
    return 0
}

function arsenalMatchScore(requiredTags: string[], arsenal: ArsenalItem[] | undefined): number {
    if (!requiredTags.length) return 0
    if (!arsenal || arsenal.length === 0) return -1
    const availableTags = new Set<string>()
    for (const item of arsenal) {
        if (!item.available) continue
        for (const tag of normalizeTags(item.tags)) {
            availableTags.add(tag)
        }
    }
    const missing = requiredTags.filter((tag) => !availableTags.has(tag))
    if (missing.length === 0) return 0.5
    return -0.5
}

function constraintPenalty(requiredTags: string[], constraints: Json | null): number {
    if (!constraints || !requiredTags.length) return 0
    if (typeof constraints !== 'object' || Array.isArray(constraints)) return 0
    const excluded = (constraints as { excluded_tools_tags?: string[] }).excluded_tools_tags
    if (!excluded || excluded.length === 0) return 0
    const hits = requiredTags.filter((tag) => excluded.includes(tag))
    return hits.length > 0 ? -1 : 0
}

function lastAttemptedForTask(attempts: Attempt[], taskId: string): Attempt | null {
    const matches = attempts.filter((attempt) => attempt.task_id === taskId)
    if (matches.length === 0) return null
    return matches.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
}

export function recommendTasks(input: RecommendationInput): RecommendationResult[] {
    const {
        tasks,
        attempts,
        availableMinutes,
        config,
        profile,
        arsenal,
    } = input

    const weights = {
        priority: config?.weight_priority ?? 1,
        timeFit: config?.weight_time_fit ?? 1,
        skillMatch: config?.weight_skill_match ?? 1,
        stale: config?.weight_stale ?? 1,
        recencyPenalty: config?.weight_recency_penalty ?? 1,
    }
    const staleDays = config?.stale_days_threshold ?? 14
    const recentDays = config?.recent_days_threshold ?? 3
    const focusSkills = normalizeTags(config?.focus_skills ?? null)
    const profileFocus = normalizeTags(profile?.focus_skills_top3 ?? null)
    const profileConstraints = profile?.constraints ?? null

    const now = new Date()

    const scored = tasks.map((task) => {
        const reasons: string[] = []
        let score = 0

        const pScore = priorityScore(task.priority)
        score += pScore * weights.priority
        reasons.push(`priority ${task.priority}`)

        const tScore = timeFitScore(
            task.estimated_minutes_min,
            task.estimated_minutes_max,
            availableMinutes
        )
        score += tScore * weights.timeFit
        reasons.push(`time fit ${tScore.toFixed(2)}`)

        const skills = normalizeTags(task.skills_tags)
        const sScore = skillMatchScore(skills, focusSkills.length ? focusSkills : profileFocus)
        if (skills.length > 0 && (focusSkills.length > 0 || profileFocus.length > 0)) {
            reasons.push(`skill match ${sScore.toFixed(2)}`)
        }
        score += sScore * weights.skillMatch

        const requiredTools = normalizeTags(task.required_tools_tags)
        const arsenalScore = arsenalMatchScore(requiredTools, arsenal)
        if (requiredTools.length > 0) {
            reasons.push(
                arsenalScore < 0 ? 'missing required tools' : 'tools available'
            )
        }
        score += arsenalScore

        const constraintScore = constraintPenalty(requiredTools, profileConstraints)
        if (constraintScore < 0) {
            reasons.push('blocked by constraints')
        }
        score += constraintScore

        const energyScore = energyFitScore(availableMinutes, profile?.energy_preference ?? null)
        if (energyScore > 0) {
            reasons.push(`energy fit ${profile?.energy_preference}`)
        }
        score += energyScore

        const lastAttempt = lastAttemptedForTask(attempts, task.id)
        if (!lastAttempt) {
            score += 0.5 * weights.stale
            reasons.push('stale boost (never attempted)')
        } else {
            const days = daysSince(lastAttempt.created_at, now)
            if (days >= staleDays) {
                score += 0.5 * weights.stale
                reasons.push(`stale boost (${days.toFixed(1)} days)`)
            }
            if (days <= recentDays) {
                score -= 0.5 * weights.recencyPenalty
                reasons.push(`recency penalty (${days.toFixed(1)} days)`)
            }
        }

        return { task, score, reasons }
    })

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
}

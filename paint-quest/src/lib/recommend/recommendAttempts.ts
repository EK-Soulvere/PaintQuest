import type { Database, Json } from '@/lib/types/database.types'

type QuestAttemptTemplate = Database['public']['Tables']['quest_attempt_template']['Row']

export interface AttemptRecommendationInput {
    templates: QuestAttemptTemplate[]
    availableMinutes: number
    energy: 'low' | 'med' | 'high'
    bottomSkills: string[]
    availableToolTags: string[]
    recentTemplateIds: string[]
}

export interface AttemptRecommendation {
    template: QuestAttemptTemplate
    score: number
    reasons: string[]
    recommendedMinutes: number
}

function normalizeTags(tags: Json | null): string[] {
    if (!Array.isArray(tags)) return []
    return tags.map(String)
}

function timeFitScore(min: number, max: number, available: number): number {
    if (available >= min && available <= max) return 1
    if (available < min) return Math.max(0, 1 - (min - available) / Math.max(min, 1))
    return Math.max(0, 1 - (available - max) / Math.max(max, 1))
}

export function recommendAttempts(input: AttemptRecommendationInput): AttemptRecommendation[] {
    const {
        templates,
        availableMinutes,
        energy,
        bottomSkills,
        availableToolTags,
        recentTemplateIds,
    } = input

    const normalizedBottom = bottomSkills.map((skill) => skill.toLowerCase())
    const normalizedTools = new Set(availableToolTags.map((tag) => tag.toLowerCase()))
    const recentSet = new Set(recentTemplateIds)

    const scored = templates.map((template) => {
        const reasons: string[] = []
        let score = 1

        const tScore = timeFitScore(
            template.estimated_minutes_min,
            template.estimated_minutes_max,
            availableMinutes
        )
        score += tScore
        reasons.push(`time fit ${tScore.toFixed(2)}`)

        if (template.energy === energy) {
            score += 0.5
            reasons.push(`energy fit ${energy}`)
        } else {
            score -= 0.2
            reasons.push(`energy mismatch ${template.energy}`)
        }

        const focusSkills = normalizeTags(template.focus_skills_tags).map((skill) =>
            skill.toLowerCase()
        )
        const bottomSkillMatches = focusSkills.filter((skill) =>
            normalizedBottom.includes(skill)
        )
        if (bottomSkillMatches.length > 0) {
            score += 0.5
            reasons.push(`targets skill: ${bottomSkillMatches.join(', ')}`)
        }

        const requiredTools = normalizeTags(template.required_tools_tags)
        if (requiredTools.length > 0) {
            const missing = requiredTools.filter(
                (tag) => !normalizedTools.has(tag.toLowerCase())
            )
            if (missing.length === 0) {
                score += 0.3
                reasons.push('tools ready')
            } else {
                score -= 0.4
                reasons.push(`missing tools: ${missing.join(', ')}`)
            }
        }

        if (recentSet.has(template.id)) {
            score -= 0.3
            reasons.push('recently used')
        }

        const recommendedMinutes = Math.min(
            template.estimated_minutes_max,
            Math.max(template.estimated_minutes_min, availableMinutes)
        )

        return {
            template,
            score: Math.max(0, score),
            reasons,
            recommendedMinutes,
        }
    })

    return scored.sort((a, b) => b.score - a.score).slice(0, 5)
}

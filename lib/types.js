"use strict";
// VeritasAI — Shared Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoreLevel = getScoreLevel;
exports.getScoreLabel = getScoreLabel;
exports.getScoreColor = getScoreColor;
// Score utilities
function getScoreLevel(score) {
    if (score <= 20)
        return 'safe';
    if (score <= 40)
        return 'mild';
    if (score <= 60)
        return 'moderate';
    if (score <= 80)
        return 'severe';
    return 'critical';
}
function getScoreLabel(score, lang = 'es') {
    const level = getScoreLevel(score);
    const labels = {
        es: {
            safe: 'Mayormente neutral',
            mild: 'Sesgo leve',
            moderate: 'Manipulación moderada',
            severe: 'Manipulación severa',
            critical: 'Propaganda activa',
        },
        en: {
            safe: 'Mostly neutral',
            mild: 'Mild bias',
            moderate: 'Moderate manipulation',
            severe: 'Severe manipulation',
            critical: 'Active propaganda',
        },
    };
    return labels[lang][level];
}
function getScoreColor(score) {
    if (score <= 20)
        return 'var(--score-safe)';
    if (score <= 40)
        return 'var(--score-mild)';
    if (score <= 60)
        return 'var(--score-moderate)';
    if (score <= 80)
        return 'var(--score-severe)';
    return 'var(--score-critical)';
}

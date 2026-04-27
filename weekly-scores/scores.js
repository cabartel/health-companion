#!/usr/bin/env node
/**
 * Health Companion - Weekly Scores Module
 * 
 * Tracks condition-specific severity/functionality scores over time.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || '/home/openclaw', '.openclaw/workspace/memory');
const SCORES_FILE = path.join(MEMORY_DIR, 'health-scores.md');

function ensureDir() {
    if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
}

// Load scores
function loadScores() {
    if (!fs.existsSync(SCORES_FILE)) {
        return [];
    }
    
    const scores = [];
    const content = fs.readFileSync(SCORES_FILE, 'utf8');
    const lines = content.split('\n');
    
    let current = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('### Week ')) {
            if (current) scores.push(current);
            const week = trimmed.slice(9);
            current = { week, score: '', notes: '', date: '' };
        } else if (trimmed.startsWith('- **Date:**')) {
            if (current) current.date = trimmed.split('**Date:**')[1].trim();
        } else if (trimmed.startsWith('- **Score:**')) {
            if (current) current.score = trimmed.split('**Score:**')[1].trim().replace('/10', '');
        } else if (trimmed.startsWith('- **Notes:**')) {
            if (current) current.notes = trimmed.split('**Notes:**')[1].trim();
        }
    }
    
    if (current) scores.push(current);
    return scores;
}

// Save scores
function saveScores(scores) {
    ensureDir();
    
    let lines = ['# Health Weekly Scores\n'];
    lines.push(`\n*Last updated: ${new Date().toISOString()}*\n`);
    lines.push('Use this to track condition-specific severity or functionality scores over time.\n');
    
    if (!scores.length) {
        lines.push('*No scores logged yet.*\n');
    } else {
        lines.push('\n## Score History\n');
        const sorted = scores.sort((a, b) => b.week.localeCompare(a.week));
        
        for (const s of sorted) {
            lines.push(`### Week ${s.week}`);
            if (s.date) lines.push(`- **Date:** ${s.date}`);
            if (s.score) lines.push(`- **Score:** ${s.score}/10`);
            if (s.notes) lines.push(`- **Notes:** ${s.notes}`);
            lines.push('');
        }
    }
    
    fs.writeFileSync(SCORES_FILE, lines.join('\n'));
}

// Add score
function addScore(score, notes = '', date = null) {
    const scores = loadScores();
    
    const d = date ? new Date(date) : new Date();
    const week = `${d.getFullYear()}-${d.getISOWeek()}`;
    
    const entry = {
        week,
        score,
        notes,
        date: date || d.toISOString().split('T')[0]
    };
    
    // Check if week already exists
    const existing = scores.findIndex(s => s.week === week);
    if (existing >= 0) {
        scores[existing] = entry;
    } else {
        scores.push(entry);
    }
    
    saveScores(scores);
    
    const action = existing >= 0 ? 'Updated' : 'Logged';
    return `✅ ${action} score for Week ${week} (${score}/10)`;
}

// List scores
function listScores(weeks = 8) {
    const scores = loadScores();
    
    if (!scores.length) {
        return 'No scores logged yet.\n\nUse `/health score <n> [--notes <text>]` to log one.';
    }
    
    const sorted = scores.sort((a, b) => b.week.localeCompare(a.week)).slice(0, weeks);
    
    let output = `## Recent Scores (${sorted.length} weeks)\n`;
    for (const s of sorted) {
        output += `\n### Week ${s.week}\n`;
        if (s.date) output += `**Date:** ${s.date}\n`;
        if (s.score) output += `**Score:** ${s.score}/10\n`;
        if (s.notes) output += `**Notes:** ${s.notes}\n`;
    }
    
    return output;
}

// Get trend
function getTrend(weeks = 8) {
    const scores = loadScores();
    
    const numericScores = scores.filter(s => s.score && !isNaN(parseInt(s.score)));
    
    if (numericScores.length < 2) {
        return 'Need at least 2 scores to calculate trends.';
    }
    
    const sorted = numericScores.sort((a, b) => a.week.localeCompare(b.week)).slice(-weeks);
    const values = sorted.map(s => parseInt(s.score));
    
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    
    let trend = change > 0 ? '📈 Improving' : change < 0 ? '📉 Worsening' : '➡️ Stable';
    if (change > 0) trend = '📈 Lower is better — worsening';
    else if (change < 0) trend = '📉 Lower is better — improving';
    
    let output = '## Score Trend Analysis\n';
    output += `- **Weeks analyzed:** ${values.length}\n`;
    output += `- **Average score:** ${avg}/10\n`;
    output += `- **First score:** ${first}/10\n`;
    output += `- **Latest score:** ${last}/10\n`;
    output += `- **Trend:** ${trend} (${change >= 0 ? '+' : ''}${change} over ${values.length - 1} weeks)\n`;
    
    return output;
}

// CLI
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
    console.log('Usage: scores.js <command> [args]');
    console.log('\nCommands:');
    console.log('  add <score> [--notes <text>] [--date <YYYY-MM-DD>]');
    console.log('  list [weeks]');
    console.log('  trend [weeks]');
    process.exit(1);
}

if (cmd === 'add') {
    if (!args[1]) {
        console.log('Usage: scores.js add <score> [options]');
        process.exit(1);
    }
    
    const score = args[1];
    let notes = '', date = null;
    
    for (let i = 2; i < args.length; i++) {
        if (args[i] === '--notes' && args[i+1]) notes = args[i+1], i++;
        else if (args[i] === '--date' && args[i+1]) date = args[i+1], i++;
    }
    
    console.log(addScore(score, notes, date));
} else if (cmd === 'list') {
    console.log(listScores(parseInt(args[1]) || 8));
} else if (cmd === 'trend') {
    console.log(getTrend(parseInt(args[1]) || 8));
} else {
    console.log(`Unknown command: ${cmd}`);
}

// Add ISO week helper
Date.prototype.getISOWeek = function() {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return (d - yearStart) / 86400000 / 7 + 1;
};
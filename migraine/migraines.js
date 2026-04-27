#!/usr/bin/env node
/**
 * Health Companion - Migraine Tracking Module
 * 
 * Logs migraine episodes with triggers, severity, and relief.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || '/home/openclaw', '.openclaw/workspace/memory');
const MIGRAINES_FILE = path.join(MEMORY_DIR, 'health-migraines.md');

function ensureDir() {
    if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
}

// Load migraines
function loadMigraines() {
    if (!fs.existsSync(MIGRAINES_FILE)) {
        return [];
    }
    
    const migraines = [];
    const content = fs.readFileSync(MIGRAINES_FILE, 'utf8');
    const lines = content.split('\n');
    
    let current = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
            if (current) migraines.push(current);
            current = { id: '', date: trimmed.slice(4), severity: '', triggers: '', relief: '', notes: '' };
        } else if (trimmed.startsWith('- **ID:**')) {
            if (current) current.id = trimmed.split('**ID:**')[1].trim();
        } else if (trimmed.startsWith('- **Severity:**')) {
            if (current) current.severity = trimmed.split('**Severity:**')[1].trim().replace('/10', '');
        } else if (trimmed.startsWith('- **Triggers:**')) {
            if (current) current.triggers = trimmed.split('**Triggers:**')[1].trim();
        } else if (trimmed.startsWith('- **Relief:**')) {
            if (current) current.relief = trimmed.split('**Relief:**')[1].trim();
        } else if (trimmed.startsWith('- **Notes:**')) {
            if (current) current.notes = trimmed.split('**Notes:**')[1].trim();
        }
    }
    
    if (current) migraines.push(current);
    return migraines;
}

// Save migraines
function saveMigraines(migraines) {
    ensureDir();
    
    let lines = ['# Health Migraines\n'];
    lines.push(`\n*Last updated: ${new Date().toISOString()}*\n`);
    
    if (!migraines.length) {
        lines.push('*No migraines logged yet.*\n');
    } else {
        // Sort by date descending
        const sorted = migraines.sort((a, b) => b.date.localeCompare(a.date));
        
        for (const m of sorted) {
            lines.push(`### ${m.date}`);
            if (m.id) lines.push(`- **ID:** ${m.id}`);
            if (m.severity) lines.push(`- **Severity:** ${m.severity}/10`);
            if (m.triggers) lines.push(`- **Triggers:** ${m.triggers}`);
            if (m.relief) lines.push(`- **Relief:** ${m.relief}`);
            if (m.notes) lines.push(`- **Notes:** ${m.notes}`);
            lines.push('');
        }
    }
    
    fs.writeFileSync(MIGRAINES_FILE, lines.join('\n'));
}

// Add migraine
function addMigraine(severity, triggers = '', relief = '', notes = '', date = null) {
    const migraines = loadMigraines();
    
    const migraine = {
        id: Date.now().toString(36),
        date: date || new Date().toISOString().split('T')[0],
        severity,
        triggers,
        relief,
        notes
    };
    
    migraines.push(migraine);
    saveMigraines(migraines);
    
    return `✅ Logged migraine (${migraine.date}, severity ${severity}/10)`;
}

// Remove migraine
function removeMigraine(id) {
    const migraines = loadMigraines();
    const before = migraines.length;
    const filtered = migraines.filter(m => m.id !== id);
    
    if (filtered.length === before) {
        return `❓ Migraine ID '${id}' not found.`;
    }
    
    saveMigraines(filtered);
    return `✅ Removed migraine ${id}`;
}

// List migraines
function listMigraines(limit = 10) {
    const migraines = loadMigraines();
    
    if (!migraines.length) {
        return 'No migraines logged yet.\n\nUse `/health migraine add --severity <n> [--triggers <list>]` to add one.';
    }
    
    const sorted = migraines.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    
    let output = `## Recent Migraines (${sorted.length})\n`;
    for (const m of sorted) {
        output += `\n### ${m.date}\n`;
        if (m.severity) output += `**Severity:** ${m.severity}/10\n`;
        if (m.triggers) output += `**Triggers:** ${m.triggers}\n`;
        if (m.relief) output += `**Relief:** ${m.relief}\n`;
        if (m.notes) output += `**Notes:** ${m.notes}\n`;
    }
    
    return output;
}

// Get stats
function getStats() {
    const migraines = loadMigraines();
    
    if (!migraines.length) {
        return 'No migraine data to analyze.';
    }
    
    const severities = migraines.filter(m => m.severity).map(m => parseInt(m.severity));
    const avg = severities.length ? (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1) : 'N/A';
    const max = severities.length ? Math.max(...severities) : 'N/A';
    
    // Count triggers
    const triggerCounts = {};
    for (const m of migraines) {
        if (m.triggers) {
            for (const t of m.triggers.split(',')) {
                const trimmed = t.trim();
                if (trimmed) {
                    triggerCounts[trimmed] = (triggerCounts[trimmed] || 0) + 1;
                }
            }
        }
    }
    
    let output = '## Migraine Statistics\n';
    output += `- **Total migraines:** ${migraines.length}\n`;
    if (avg !== 'N/A') output += `- **Average severity:** ${avg}/10\n`;
    if (max !== 'N/A') output += `- **Max severity:** ${max}/10\n`;
    
    if (Object.keys(triggerCounts).length) {
        output += '\n**Common triggers:**\n';
        const sorted = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        for (const [trigger, count] of sorted) {
            output += `- ${trigger}: ${count}\n`;
        }
    }
    
    return output;
}

// CLI
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
    console.log('Usage: migraines.js <command> [args]');
    console.log('\nCommands:');
    console.log('  add [--severity <n>] [--triggers <list>] [--relief <text>] [--notes <text>] [--date <YYYY-MM-DD>]');
    console.log('  remove <id>');
    console.log('  list [limit]');
    console.log('  stats');
    process.exit(1);
}

if (cmd === 'add') {
    let severity = '', triggers = '', relief = '', notes = '', date = null;
    
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--severity' && args[i+1]) severity = args[i+1], i++;
        else if (args[i] === '--triggers' && args[i+1]) triggers = args[i+1], i++;
        else if (args[i] === '--relief' && args[i+1]) relief = args[i+1], i++;
        else if (args[i] === '--notes' && args[i+1]) notes = args[i+1], i++;
        else if (args[i] === '--date' && args[i+1]) date = args[i+1], i++;
    }
    
    if (!severity) {
        console.log('Error: --severity is required');
        process.exit(1);
    }
    
    console.log(addMigraine(severity, triggers, relief, notes, date));
} else if (cmd === 'remove') {
    console.log(removeMigraine(args[1] || ''));
} else if (cmd === 'list') {
    console.log(listMigraines(parseInt(args[1]) || 10));
} else if (cmd === 'stats') {
    console.log(getStats());
} else {
    console.log(`Unknown command: ${cmd}`);
}
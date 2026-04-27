#!/usr/bin/env node
/**
 * Health Companion - Intervention Tracker Module
 * 
 * Tracks controlled trials of treatments/therapies with custom benchmarks.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || '/home/openclaw', '.openclaw/workspace/memory');
const INTERVENTIONS_FILE = path.join(MEMORY_DIR, 'health-interventions.md');
const BENCHMARKS_FILE = path.join(__dirname, '..', 'config', 'benchmarks.json');

// Ensure memory directory exists
function ensureDir() {
    if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
}

// Load benchmarks config
function loadBenchmarks() {
    try {
        return JSON.parse(fs.readFileSync(BENCHMARKS_FILE, 'utf8'));
    } catch (e) {
        return { categories: {} };
    }
}

// List available benchmarks
function listBenchmarks() {
    const config = loadBenchmarks();
    let output = '## Available Benchmark Categories\n';
    
    for (const [catId, catData] of Object.entries(config.categories)) {
        output += `\n### ${catData.label}\n`;
        for (const bm of catData.benchmarks) {
            output += `- \`${bm.id}\` — ${bm.label}\n`;
        }
    }
    
    return output;
}

// Start a new trial
function startTrial(name, benchmarks, weeks, notes = '') {
    ensureDir();
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (parseInt(weeks) * 7));
    
    const trial = {
        id: Date.now().toString(36),
        name,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        durationWeeks: parseInt(weeks),
        benchmarks: benchmarks.split(',').map(b => b.trim()),
        notes,
        dailyLogs: [],
        status: 'active'
    };
    
    // Load existing data
    let data = { trials: [], completed: [] };
    if (fs.existsSync(INTERVENTIONS_FILE)) {
        // Simple parse - just append for now
    }
    
    data.trials.push(trial);
    
    // Save to file
    saveInterventions(data);
    
    return `✅ Started trial: *${name}*\nDuration: ${weeks} weeks\nBenchmarks: ${trial.benchmarks.join(', ')}`;
}

// List trials
function listTrials(status = 'active') {
    if (!fs.existsSync(INTERVENTIONS_FILE)) {
        return `No ${status} trials.`;
    }
    
    const content = fs.readFileSync(INTERVENTIONS_FILE, 'utf8');
    // Simple parse - look for sections
    let output = `## ${status.charAt(0).toUpperCase() + status.slice(1)} Trials\n`;
    
    // For now, return a placeholder - full parsing would be more complex
    // In a real implementation, we'd store JSON alongside markdown
    
    return output + '\n(Trials data stored in markdown - use /health start to create new trials)';
}

// Save interventions to markdown
function saveInterventions(data) {
    ensureDir();
    
    let lines = ['# Health Interventions\n'];
    lines.push(`\n*Last updated: ${new Date().toISOString()}*\n`);
    
    if (data.trials && data.trials.length) {
        lines.push('## Active Trials\n');
        for (const trial of data.trials) {
            lines.push(`### ${trial.name} (ID: ${trial.id})`);
            lines.push(`- **Started:** ${trial.startDate}`);
            lines.push(`- **Target End:** ${trial.endDate}`);
            lines.push(`- **Duration:** ${trial.durationWeeks} weeks`);
            lines.push(`- **Benchmarks:** ${trial.benchmarks.join(', ')}`);
            lines.push(`- **Days Logged:** ${trial.dailyLogs.length}`);
            lines.push('');
        }
    }
    
    if (data.completed && data.completed.length) {
        lines.push('\n## Completed Trials\n');
        for (const trial of data.completed) {
            lines.push(`### ${trial.name}`);
            lines.push(`- **Period:** ${trial.startDate} to ${trial.endDate}`);
            lines.push('');
        }
    }
    
    fs.writeFileSync(INTERVENTIONS_FILE, lines.join('\n'));
}

// Main CLI
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
    console.log('Usage: tracker.js <command> [args]');
    console.log('\nCommands:');
    console.log('  start <name> --benchmarks <list> --weeks <n> [--notes <text>]');
    console.log('  list [active|completed]');
    console.log('  benchmarks');
    process.exit(1);
}

if (cmd === 'start') {
    const name = args[1] || 'New Intervention';
    let benchmarks = '';
    let weeks = 4;
    let notes = '';
    
    for (let i = 2; i < args.length; i++) {
        if (args[i] === '--benchmarks' && args[i+1]) {
            benchmarks = args[i+1];
            i++;
        } else if (args[i] === '--weeks' && args[i+1]) {
            weeks = args[i+1];
            i++;
        } else if (args[i] === '--notes' && args[i+1]) {
            notes = args[i+1];
            i++;
        }
    }
    
    console.log(startTrial(name, benchmarks, weeks, notes));
} else if (cmd === 'list') {
    console.log(listTrials(args[1] || 'active'));
} else if (cmd === 'benchmarks') {
    console.log(listBenchmarks());
} else {
    console.log(`Unknown command: ${cmd}`);
}
#!/usr/bin/env node
/**
 * Health Companion - Medication Tracking Module
 * 
 * Keeps track of current medications and dosages.
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.env.HOME || '/home/openclaw', '.openclaw/workspace/memory');
const MEDICATIONS_FILE = path.join(MEMORY_DIR, 'health-medications.md');

function ensureDir() {
    if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
}

// Load medications
function loadMeds() {
    if (!fs.existsSync(MEDICATIONS_FILE)) {
        return [];
    }
    
    const meds = [];
    const content = fs.readFileSync(MEDICATIONS_FILE, 'utf8');
    const lines = content.split('\n');
    
    let current = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
            if (current) meds.push(current);
            current = { name: trimmed.slice(4), dosage: '', frequency: '', prescriber: '', notes: '' };
        } else if (trimmed.startsWith('- **Dosage:**')) {
            if (current) current.dosage = trimmed.split('**Dosage:**')[1].trim();
        } else if (trimmed.startsWith('- **Frequency:**')) {
            if (current) current.frequency = trimmed.split('**Frequency:**')[1].trim();
        } else if (trimmed.startsWith('- **Prescriber:**')) {
            if (current) current.prescriber = trimmed.split('**Prescriber:**')[1].trim();
        } else if (trimmed.startsWith('- **Notes:**')) {
            if (current) current.notes = trimmed.split('**Notes:**')[1].trim();
        }
    }
    
    if (current) meds.push(current);
    return meds;
}

// Save medications
function saveMeds(meds) {
    ensureDir();
    
    let lines = ['# Health Medications\n'];
    lines.push(`\n*Last updated: ${new Date().toISOString()}*\n`);
    
    if (!meds.length) {
        lines.push('*No medications tracked yet.*\n');
    } else {
        for (const med of meds) {
            lines.push(`### ${med.name}`);
            if (med.dosage) lines.push(`- **Dosage:** ${med.dosage}`);
            if (med.frequency) lines.push(`- **Frequency:** ${med.frequency}`);
            if (med.prescriber) lines.push(`- **Prescriber:** ${med.prescriber}`);
            if (med.notes) lines.push(`- **Notes:** ${med.notes}`);
            lines.push('');
        }
    }
    
    fs.writeFileSync(MEDICATIONS_FILE, lines.join('\n'));
}

// Add medication
function addMed(name, dosage = '', frequency = '', prescriber = '', notes = '') {
    const meds = loadMeds();
    
    meds.push({ name, dosage, frequency, prescriber, notes });
    saveMeds(meds);
    
    return `✅ Added medication: *${name}*${dosage ? ` (${dosage})` : ''}`;
}

// Remove medication
function removeMed(name) {
    const meds = loadMeds();
    const before = meds.length;
    const filtered = meds.filter(m => m.name.toLowerCase() !== name.toLowerCase());
    
    if (filtered.length === before) {
        return `❓ Medication '${name}' not found.`;
    }
    
    saveMeds(filtered);
    return `✅ Removed medication: *${name}*`;
}

// List medications
function listMeds() {
    const meds = loadMeds();
    
    if (!meds.length) {
        return 'No medications tracked yet.\n\nUse `/health med add <name> --dosage <amount> --frequency <freq>` to add one.';
    }
    
    let output = '## Current Medications\n';
    for (const med of meds) {
        output += `\n### ${med.name}\n`;
        if (med.dosage) output += `**Dosage:** ${med.dosage}\n`;
        if (med.frequency) output += `**Frequency:** ${med.frequency}\n`;
        if (med.prescriber) output += `**Prescriber:** ${med.prescriber}\n`;
        if (med.notes) output += `**Notes:** ${med.notes}\n`;
    }
    
    return output;
}

// CLI
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
    console.log('Usage: meds.js <command> [args]');
    console.log('\nCommands:');
    console.log('  add <name> [--dosage <amount>] [--frequency <freq>] [--prescriber <doc>] [--notes <text>]');
    console.log('  remove <name>');
    console.log('  list');
    process.exit(1);
}

if (cmd === 'add') {
    const name = args[1] || 'New Medication';
    let dosage = '', frequency = '', prescriber = '', notes = '';
    
    for (let i = 2; i < args.length; i++) {
        if (args[i] === '--dosage' && args[i+1]) dosage = args[i+1], i++;
        else if (args[i] === '--frequency' && args[i+1]) frequency = args[i+1], i++;
        else if (args[i] === '--prescriber' && args[i+1]) prescriber = args[i+1], i++;
        else if (args[i] === '--notes' && args[i+1]) notes = args[i+1], i++;
    }
    
    console.log(addMed(name, dosage, frequency, prescriber, notes));
} else if (cmd === 'remove') {
    console.log(removeMed(args[1] || ''));
} else if (cmd === 'list') {
    console.log(listMeds());
} else {
    console.log(`Unknown command: ${cmd}`);
}
---
name: health-companion
description: Comprehensive health tracking for Heyron agents - interventions, medications, migraines, and weekly scores
version: 1.0
triggers:
  - health
  - health-companion
  - intervention
  - medication
  - migraine
category: health
license: MIT
metadata:
  author: Cheryl & Lucy
  requires:
    - filesystem
    - exec
---

# Health Companion

A comprehensive health tracking skill for Heyron agents. Track interventions, symptoms, medications, migraines, and condition-specific weekly scores — all in one place.

## Overview

Health Companion is a **modular** health memory system. Users can use all modules or just the pieces they need:

- **Intervention Tracker** — Run controlled trials of treatments/therapies with custom benchmarks
- **Medication Tracking** — Keep a running list of current medications and dosages
- **Migraine Tracking** — Log migraine episodes with triggers, severity, and relief
- **Weekly Scores** — Track condition-specific severity scores over time
- **Summary View** — Pull everything together into a health snapshot

## Benchmarks

Benchmarks are **configurable**. Users can choose from preset benchmarks or define their own:

### Preset Benchmarks (ME/CFS)
- Sleep duration (hours)
- Sleep quality (1-10)
- Fatigue (1-10)
- Brain fog (1-10)
- PEM (1-10)
- Pain (1-10)

### Preset Benchmarks (General)
- Falls (count)
- Hypoglycemic episodes (count)
- Seizures (count)
- Flare severity (1-10)
- Mood (1-10)
- Custom...

## Usage

```bash
# Start a new intervention trial
/health start "Low-dose naltrexone" --benchmarks fatigue,brain-fog,pain --weeks 4

# Log daily values for the active trial
/health log fatigue 7 brain-fog 5

# View current medications
/health meds

# Add a medication
/health med add "Metformin XR" 500mg --morning

# View recent migraines
/health migraines

# Log a migraine
/health migraine add --severity 8 --triggers "stress,weather" --relief "rest"

# Log weekly score
/health score 6

# Get a full health summary
/health summary
```

## Data Storage

All data is stored in plain Markdown/JSON files in the agent's workspace:
- `memory/health-interventions.md` — Trial data
- `memory/health-medications.md` — Medication list
- `memory/health-migraines.md` — Migraine log
- `memory/health-scores.md` — Weekly scores

## Installation

This skill is designed to be dropped into any Heyron agent:

```bash
# Copy the skill folder to your skills directory
cp -r health-companion ~/path/to/skills/

# Restart your agent to detect the new skill
```

## Customization

Edit `config/benchmarks.json` to add your own benchmark categories. The skill will automatically include them when users create new trials.

## Error Handling

| Scenario | What to Do |
|----------|------------|
| File not found | Create new file with header |
| JSON parse error (benchmarks.json) | Return friendly error, show available categories |
| Invalid benchmark | Show list of valid benchmarks |
| Trial not found | Return error with trial ID suggestion |
| No data yet | Return friendly empty state message |

## Time Estimates

| Operation | Estimate |
|-----------|----------|
| Start intervention | ~1s |
| Log daily values | ~1s |
| Add medication | ~1s |
| Log migraine | ~1s |
| Add weekly score | ~1s |
| List/view operations | ~1s |
| Benchmark list | ~1s |

## Examples

### Example 1: Start an Intervention Trial
```bash
/health start "Vitamin D" --benchmarks fatigue,brain-fog --weeks 4
```
*Output:* ✅ Started trial: *Vitamin D*
Duration: 4 weeks
Benchmarks: fatigue, brain-fog

### Example 2: Add a Medication
```bash
/health med add "Metformin XR" --dosage 500mg --frequency daily
```
*Output:* ✅ Added medication: *Metformin XR* (500mg)

### Example 3: Log a Migraine
```bash
/health migraine add --severity 8 --triggers "stress,weather" --relief "rest"
```
*Output:* ✅ Logged migraine (2026-04-26, severity 8/10)

### Example 4: Log Weekly Score
```bash
/health score 6
```
*Output:* ✅ Logged score for Week 17 (6/10)

### Example 5: View Recent Migraines
```bash
/health migraines
```
*Output:* Lists recent migraines with date, severity, triggers, relief

### Example 6: List Benchmarks
```bash
/health benchmarks
```
*Output:* Shows all available benchmark categories and IDs

## Related Skills

- `study` — For reading memory files before sessions
- `remember` — For saving important health decisions to memory
- `brainstorm` — For generating new intervention ideas
- `skill-audit` — For reviewing and improving skills

## License

MIT
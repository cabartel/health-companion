# Health Companion Demo

## Transcript showing the skill in action

---

### 1. List Available Benchmarks

```bash
$ node intervention/tracker.js benchmarks
```

**Output:**
```
## Available Benchmark Categories

### ME/CFS
- `sleep-duration` — Sleep Duration
- `sleep-quality` — Sleep Quality
- `fatigue` — Fatigue
- `brain-fog` — Brain Fog
- `pem` — PEM
- `pain` — Pain
- `dizziness` — Dizziness
- `nausea` — Nausea

### Diabetes
- `blood-sugar` — Blood Sugar
- `hypo-episodes` — Hypoglycemic Episodes
- `hyper-episodes` — Hyperglycemic Episodes
- `energy` — Energy

### Fall Risk
- `falls` — Falls
- `near-falls` — Near Falls
- `balance` — Balance
- `mobility` — Mobility

### Mental Health
- `mood` — Mood
- `anxiety` — Anxiety
- `sleep` — Sleep
- `medication-adherence` — Medication Adherence
```

---

### 2. Start an Intervention Trial

```bash
$ node intervention/tracker.js start "Vitamin D" --benchmarks fatigue,brain-fog --weeks 4
```

**Output:**
```
✅ Started trial: *Vitamin D*
Duration: 4 weeks
Benchmarks: fatigue, brain-fog
```

---

### 3. Add a Medication

```bash
$ node medication/meds.js add "Metformin XR" --dosage 500mg --frequency daily
```

**Output:**
```
✅ Added medication: *Metformin XR* (500mg)
```

---

### 4. Log a Migraine

```bash
$ node migraine/migraines.js add --severity 8 --triggers "stress,weather" --relief "rest"
```

**Output:**
```
✅ Logged migraine (2026-04-27, severity 8/10)
```

---

### 5. Log a Weekly Score

```bash
$ node weekly-scores/scores.js add 6 --notes "Good day, left house twice"
```

**Output:**
```
✅ Logged score for Week 2026-18 (6/10)
```

---

## What the Agent Remembers

After running these commands, the agent now has persistent memory of:

- **Active trials:** Vitamin D (4 weeks, tracking fatigue & brain-fog)
- **Medications:** Metformin XR 500mg daily
- **Migraine history:** One entry with triggers and relief
- **Weekly scores:** Score of 6/10 for Week 18

All data is stored in plain Markdown files in the agent's `memory/` directory, making it portable and persistent across sessions.

---

*Demo created: April 27, 2026*
*Skill: Health Companion v1.0*
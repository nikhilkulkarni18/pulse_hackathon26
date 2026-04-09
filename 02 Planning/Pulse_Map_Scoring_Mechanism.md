# Pulse Map Scoring Mechanism

## Purpose

The Pulse Map is meant to show `recent training stimulus`, not literal body change.

The scoring system should answer:

- Which muscle groups have been worked recently?
- How strongly were they stimulated?
- How much of that signal is still "alive" after a few days?
- Which parts of the map are starting to cool off?

This gives us a body map that feels like `momentum worth protecting`.

## Core Model

The model is event-driven:

- `rows = workout events / formats`
- `columns = muscle groups`
- `cell value = base muscle stimulus weight`

Every completed event contributes score to one or more muscle groups.

That score is then adjusted in three steps:

1. Multiply by event intensity
2. Apply time-based decay by muscle group
3. Normalize into a `0-1` activation score for the body map

## Muscle Groups

These are the anatomical groups we currently score for the body map:

- `shoulders`
- `arms`
- `chest`
- `back`
- `core`
- `glutes`
- `quads`
- `hamstrings`
- `calves`

Important note:

- `Cardio` is treated as an `event type`, not as a muscle group.
- The body map should stay anatomical.

## Event x Muscle Matrix

Base weights are on a `0.0 to 1.0` scale.

| Event | shoulders | arms | chest | back | core | glutes | quads | hamstrings | calves | Intensity |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Yoga | 0.30 | 0.10 | 0.05 | 0.70 | 0.75 | 0.30 | 0.15 | 0.95 | 0.10 | 3 |
| Boxing | 1.00 | 0.95 | 0.45 | 0.25 | 0.75 | 0.10 | 0.10 | 0.00 | 0.15 | 7 |
| HRX | 0.55 | 0.20 | 0.10 | 0.20 | 0.80 | 0.85 | 1.00 | 0.35 | 0.35 | 8 |
| Strength & Conditioning | 0.35 | 0.60 | 0.50 | 0.80 | 0.35 | 0.75 | 0.65 | 0.30 | 0.10 | 7 |
| Burn | 0.15 | 0.05 | 0.05 | 0.15 | 0.75 | 0.80 | 0.90 | 0.35 | 0.40 | 6 |
| Cardio | 0.05 | 0.00 | 0.00 | 0.10 | 0.35 | 0.45 | 0.55 | 0.35 | 0.60 | 5 |
| Lower Body Strength | 0.05 | 0.00 | 0.00 | 0.10 | 0.30 | 0.95 | 0.95 | 0.75 | 0.35 | 7 |
| Upper Body Strength | 0.90 | 0.80 | 0.75 | 0.85 | 0.25 | 0.05 | 0.05 | 0.00 | 0.00 | 7 |
| Core | 0.20 | 0.05 | 0.05 | 0.20 | 1.00 | 0.20 | 0.10 | 0.10 | 0.00 | 5 |
| Mobility | 0.20 | 0.05 | 0.00 | 0.40 | 0.45 | 0.20 | 0.10 | 0.35 | 0.10 | 2 |

## Step 1: Base Event Score

For every completed event:

```text
raw_event_score[muscle] = base_weight[muscle] x intensity
```

Example for `Boxing`:

- shoulders = `1.00 x 7 = 7.0`
- arms = `0.95 x 7 = 6.65`
- core = `0.75 x 7 = 5.25`
- chest = `0.45 x 7 = 3.15`

## Step 2: Recency Decay

Each muscle group fades independently over time.

### Half-life by muscle group

| Muscle Group | Half-life (days) |
| --- | ---: |
| shoulders | 5.0 |
| arms | 5.0 |
| chest | 5.0 |
| back | 5.0 |
| core | 4.0 |
| glutes | 5.5 |
| quads | 5.5 |
| hamstrings | 4.0 |
| calves | 4.0 |

Decay formula:

```text
decayed_score = raw_score x 0.5^(days_since_workout / half_life_days)
```

Design intent:

- signal should begin to cool visibly within `4-5 days`
- it should feel meaningfully cooler by around `7 days`
- it should feel mostly flat by around `10-14 days`

## Step 3: Aggregate by Muscle

If the user has multiple recent workouts:

```text
raw_total[muscle] = sum(all decayed event scores for that muscle)
```

This gives one combined recent-stimulus value per muscle group.

## Step 4: Repeat Bonus

If the same muscle group is hit multiple times recently, we add a small diminishing-returns bonus.

```text
repeat_multiplier = 1 + min(0.24, (hit_count - 1) x 0.08)
```

That means:

- 1 hit = `1.00`
- 2 hits = `1.08`
- 3 hits = `1.16`
- 4+ hits = `1.24` max

This rewards consistency without making repeated work scale linearly forever.

## Step 5: Normalize to a 0-1 Activation

Each muscle group is normalized into a body-map-ready activation score.

### Activation targets

| Muscle Group | Activation Target |
| --- | ---: |
| shoulders | 5.6 |
| arms | 5.6 |
| chest | 5.4 |
| back | 5.8 |
| core | 5.0 |
| glutes | 6.2 |
| quads | 6.2 |
| hamstrings | 4.6 |
| calves | 4.4 |

Normalization formula:

```text
activation = 1 - exp(-(raw_total x repeat_multiplier) / activation_target)
```

Then clamp the result to:

```text
0 <= activation <= 1
```

This lets the map saturate naturally instead of growing forever.

## Suggested Visual Thresholds

These are current recommended bands for rendering:

| Activation | Meaning |
| --- | --- |
| `< 0.10` | hidden |
| `0.10 - 0.29` | faint |
| `0.30 - 0.59` | clearly lit |
| `0.60 - 0.84` | strong |
| `0.85+` | peak |

## Design Principles

The scoring mechanism should follow these rules:

- Keep the body map anatomical
- Treat events as the source of stimulus
- Let each muscle group decay independently
- Reward repeat stimulation with diminishing returns
- Keep the final output easy to explain

This is not trying to model full physiology.
It is trying to create a believable and motivating signal that:

- shows members what they worked
- makes momentum visible
- makes cooling visible
- encourages them to come back before the signal fades

## Current Summary

In short:

1. Pick the event row from the matrix
2. Multiply each muscle weight by event intensity
3. Apply per-muscle recency decay
4. Sum all recent contributions by muscle group
5. Apply repeat bonus
6. Normalize to a `0-1` activation score
7. Render the body map from those final muscle activations

## Companion Sheet

The working spreadsheet version of this scoring model lives here:

`Pulse Map Scoring Matrix`

Use the sheet for collaborative editing of:

- event weights
- muscle half-lives
- activation targets
- threshold tuning

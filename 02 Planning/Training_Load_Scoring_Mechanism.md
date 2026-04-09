# Training Load Scoring Mechanism

## Purpose

The Training Load score is meant to show `adequacy of recent training`, not calories, not literal recovery, and not a branded external metric like `PAI`.

The scoring system should answer:

- How much useful training load has the member built recently?
- Is the member inside the right range for their goal?
- Is the current load below, in line with, or above the member's recent baseline?
- How confident are we in the score if wearable data is missing?

This gives us a load score that feels like `clear weekly context`, not just activity history.

## Core Model

The model is workout-driven.

One workout profile powers both the body map and training load:

- `intensity`
- `duration`
- `modality_factor`
- `effort_factor`
- `zone_weights`

Important note:

- The body map uses `zone_weights` plus recency decay to show where the body was stimulated.
- Training Load uses `duration`, `modality_factor`, and `effort_factor` to show whether overall effort is adequate.
- Both systems should stay consistent because they are derived from the same workout source data.

For shared context on the body-map side of the system, see:

`Pulse_Map_Scoring_Mechanism.md`

## Workout Profile Table

These are the current workout profiles used by the load model.

| Event | Intensity | Default Duration | Modality Factor | Default Effort Factor |
| --- | ---: | ---: | ---: | ---: |
| Yoga | 3 | 45 | 1.02 | 0.08 |
| Boxing | 7 | 45 | 1.06 | 0.12 |
| HRX | 8 | 50 | 1.12 | 0.13 |
| Strength & Conditioning | 7 | 50 | 1.17 | 0.11 |
| Burn | 6 | 45 | 1.08 | 0.11 |

Design intent:

- `intensity` is a simple format-level signal shared with the rest of the product.
- `default_duration` gives a stable fallback when explicit session duration is missing.
- `modality_factor` ensures strength, mixed-format, and yoga sessions get meaningful credit even when heart rate is modest.
- `default_effort_factor` is the no-wearable fallback for the format.

## Step 1: Session Load

For every completed workout:

```text
session_load = duration_minutes x modality_factor x effort_factor
```

This is the canonical unit for load.

Example:

```text
HRX session load = 50 x 1.12 x 0.13 = 7.28
Yoga session load = 45 x 1.02 x 0.08 = 3.67
```

This keeps same-format sessions comparable while still allowing duration and measured effort to move the score up or down.

## Step 2: Effort Factor Selection

Effort factor is selected in this order:

1. `measured` effort from wearable data
2. `estimated` effort from the format default
3. `low_confidence` fallback if duration is also missing and must be defaulted

### A. Rating-based effort

If an explicit effort or RPE rating exists:

```text
rating_effort = clamp(0.05 + (rating / 10) x 0.1, 0.07, 0.16)
```

### B. Heart-rate zone effort

If heart-rate zone minutes exist, we use these zone weights:

| Zone | Weight |
| --- | ---: |
| zone1 | 0.42 |
| zone2 | 0.55 |
| zone3 | 0.72 |
| zone4 | 0.90 |
| zone5 | 1.05 |

First compute a weighted zone average:

```text
weighted_zone_average =
  sum(zone_minutes[zone] x zone_weight[zone]) / sum(all zone minutes)
```

Then convert that into effort:

```text
weighted_zone_effort = clamp(0.045 + (weighted_zone_average x 0.095), 0.07, 0.17)
```

### C. Average heart-rate effort

If average BPM and max BPM exist:

```text
relative_hr = clamp(avg_bpm / max_bpm, 0.45, 0.95)
average_hr_effort = clamp(0.045 + relative_hr x 0.1, 0.07, 0.16)
```

### D. Heart-rate effort combination

If both zone-based and average-heart-rate effort are available:

```text
hr_effort = 0.65 x weighted_zone_effort + 0.35 x average_hr_effort
```

If only one of them is available, use the one that exists.

### E. Final measured effort

If both heart-rate effort and rating effort exist:

```text
measured_effort = 0.7 x hr_effort + 0.3 x rating_effort
```

If only one exists, use the one that exists.

Then blend it back slightly toward the format default so the score stays stable:

```text
final_effort_factor = 0.8 x measured_effort + 0.2 x default_effort_factor
```

If no measured signal exists:

```text
effort_factor = default_effort_factor
```

## Step 3: Rolling Load

The main member-facing number is a rolling 7-day total:

```text
rolling_7d_load = sum(session_load over last 7 days)
```

This is what should be shown against the personalized target range.

Design intent:

- avoid calendar-week resets
- make the score smoother day to day
- keep the score easy to explain in one sentence

## Step 4: Baseline Load

We also calculate a recent baseline using the prior 28 days:

```text
baseline_28d_load = sum(session_load over prior 28 days) / 4
```

This creates a `7-day-equivalent baseline`, so the current rolling load and the recent baseline stay in the same unit.

Important note:

- the current 7-day window and the prior 28-day baseline window should not overlap

## Step 5: Relative State

Relative state compares the current rolling 7-day load against the recent 28-day-equivalent baseline.

First compute:

```text
ratio = rolling_7d_load / baseline_28d_load
delta = rolling_7d_load - baseline_28d_load
```

Then classify:

- `well_below` if `ratio <= 0.6` and `delta <= -4`
- `below` if `ratio < 0.88` and `delta <= -2`
- `well_above` if `ratio >= 1.45` and `delta >= 5`
- `above` if `ratio > 1.15` and `delta >= 2`
- else `in_range`

If there is no usable baseline:

- use `building`

This gives a simple interpretation layer that says whether the member is under, around, or above recent normal.

## Step 6: Goal Target Range

Goal target range is a separate personalization layer.

It is not the same thing as baseline comparison.

Target range is derived from:

- goal base range
- weekly frequency modifier
- starting-point modifier

In the current mockup:

```text
target_low = clamp(goal_base_low + frequency_modifier + level_modifier, minimum_load, maximum_load)
target_high = clamp(goal_base_high + frequency_modifier + level_modifier, minimum_load + 2, maximum_load)
```

This means:

- `target range` answers: `am I doing enough for my goal?`
- `relative state` answers: `how does this compare to my recent normal?`

Both are useful, but they should not be conflated.

## Load Confidence

Every workout should also carry a confidence label.

- `measured` if wearable-derived heart-rate effort or explicit effort rating exists
- `estimated` if no measured effort exists but explicit duration exists
- `low_confidence` if no measured effort exists and duration also had to be defaulted from the format profile

This allows the UI and downstream logic to communicate whether the load is directly measured or mostly inferred.

## Public Interfaces / Types

These are the fields the developer should expect in the load pipeline:

- `workout_type`
- `duration_minutes`
- `source`
- `heart_rate_summary`
- `effort_rating`
- `calories`
- `session_load`
- `rolling_7d_load`
- `baseline_28d_load`
- `relative_state`
- `load_confidence`

Accepted `source` values:

- `apple_health`
- `health_connect`
- `cult_class`
- `manual`

Notes:

- `calories` is optional supporting data only
- `heart_rate_summary` may include average BPM, max BPM, and zone minutes
- `session_load` is the atomic output per workout
- `rolling_7d_load` and `baseline_28d_load` are aggregate outputs

## Design Principles

The Training Load mechanism should follow these rules:

- Use one canonical score for all users
- Give strength, yoga, and mixed-format sessions real credit
- Use calories as supporting data only
- Keep the score simple enough to explain quickly
- Treat Apple Health, Health Connect, and other wearables as inputs, not the source of truth
- Keep the score consistent with the body map by reusing the same workout profile

This is not trying to be a full physiology model.
It is trying to create a believable and motivating signal that:

- tells the member whether recent effort is enough
- works with or without wearable data
- stays consistent across class types
- supports both member-facing clarity and coaching logic

## Validation Scenarios

The current implementation should be validated against these cases:

- Same duration: `HRX` should score above `Yoga`
- A strength session with moderate HR should still get substantial load
- Wearable and non-wearable versions of the same class should land in a reasonably close band
- Longer duration should increase load within the same format
- Rolling 7-day load should change smoothly day by day
- Baseline comparison should flip correctly between `below`, `in_range`, and `above`
- Missing wearable data should still produce a valid score
- Missing duration should fall back to default duration and mark the result as lower confidence

## Current Summary

In short:

1. Pick the workout profile for the event
2. Resolve `duration_minutes`
3. Resolve `effort_factor` from wearable signals if available, otherwise use the format default
4. Compute `session_load = duration x modality_factor x effort_factor`
5. Sum recent workouts into `rolling_7d_load`
6. Convert the prior 28 days into a `baseline_28d_load`
7. Classify `relative_state`
8. Compare current load to the personalized goal target range
9. Carry `load_confidence` so the system knows how much was measured versus estimated

## Companion Notes

Use this document for collaborative tuning of:

- format-level modality factors
- default effort factors
- wearable effort blending
- relative-state thresholds
- goal target ranges

Use the body-map scoring document for:

- zone weights
- muscle decay logic
- activation targets
- map visualization thresholds

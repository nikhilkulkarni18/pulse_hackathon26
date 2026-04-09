# Fitathlon Hackathon — Idea Development & Final Concept

## Context

**Hackathon:** Fitathlon (24-hour hackathon)
**Timing:** April 9, 10AM → April 10, 10AM
**Theme:** AI Everywhere — Build intelligent systems that transform operations, supercharge growth, and elevate customer and employee experiences.
**Team:** PM-led small team (2-3 people), building with AI tools (Cursor, Replit, Claude)
**Demo format:** Web/portal-based demo

**My charter:** Product Manager for Member Retention at Cult.fit — covering B2B member retention and member activation. The AI companion mascot "Curo" already exists on the app (streak tracking, dynamic island widget).

---

## Full List of Ideas Explored

### Retention & Member Engagement
1. **Churn prediction + proactive intervention engine** — Predict churn from booking/attendance patterns, auto-trigger CRM interventions. *Rejected: activity is already the biggest churn indicator and prior work here didn't yield results.*
2. **AI post-class feedback → insight loop** — Ingest class/centre ratings, cluster into themes, surface recommendations to ops and members. *Waitlisted.*
3. **Smart re-engagement copywriter for CRM** — AI generates personalized CRM copy based on member profile, pack type, and lifecycle stage. *Waitlisted — too CRM-heavy, wanted a product/tech feature.*
4. **"My Perfect Week" personalized schedule recommender** — AI generates a weekly workout plan based on preferences, goals, and real-time availability. *Rejected: already in scope for AI trainer initiative.*
5. **B2B pack conversion advisor** — Predict which B2B pack users will convert to B2C based on early behavior, recommend interventions. *Rejected: too CRM-heavy, already being worked on.*
6. **Dynamic offer/promotion optimizer** — Simulate offer strategies for member segments, recommend optimal promo. *Rejected: not compelling enough.*
7. **Centre capacity × member preference matcher** — Predict underbooked classes, push to matching members. *Waitlisted.*

### Social & Community
8. **AI workout buddy matching** — Match members with accountability partners based on fitness level, schedule, and centre. *Explored but not shortlisted.*
9. **Streak & squad gamification engine** — Weekly streaks, squad challenges, milestone badges. *Rejected: streak product already exists.*
10. **AI Workout Party** — Group class coordination where friends find and book a class together. *Shortlisted as #2, later rejected: bulk booking creates slot availability issues for other members.*
11. **AI Cult social feed** — Auto-generated post-workout activity cards, friends can give kudos. *Explored but not shortlisted.*
12. **AI Cult Squad** — Micro-community per centre, see who's in your class, connect with regulars. *Rejected: already being built by a peer this quarter.*

### Discovery & Booking
13. **AI fitness concierge — natural language booking** — "Book me a yoga class tomorrow evening, not too crowded." *Shortlisted as #1, later deprioritized: manager feedback that easy booking was tried before and didn't drive adoption.*
14. **AI "What Should I Do Today"** — Context-aware single-session recommender. *Explored, overlaps with AI trainer initiative.*
15. **AI format matchmaker — discovery quiz** — Tinder-style swipe-based class discovery. *Rejected: class discovery isn't a real pain point for users.*
16. **AI coach matchmaker** — Recommend instructors based on member's style preferences and past ratings. *Explored but not shortlisted.*
17. **AI centre heatmap & "best time to go"** — Predicted occupancy by hour/day. *Explored but not shortlisted.*

### Member Insights & Engagement
18. **AI fitness identity** — Always-on personalized profile showing who you are as a fitness person. *Shortlisted as #3.*
19. **AI Cult Wrapped — monthly shareable recap** — Spotify Wrapped for fitness. *Shortlisted as #4, later rejected: felt too obvious for a hackathon.*
20. **AI post-workout debrief / progress storyteller** — Personalized session summary with stats and context. *Waitlisted.*
21. **AI fitness forecast** — Forward-looking prediction of next month's progress. *Explored but not shortlisted.*
22. **AI "Class Replay & Highlight Reel"** — Shareable post-workout cards with rich context. *Rejected: already being built by a peer this quarter.*
23. **AI Cult TV — personalized video highlights** — AI-generated personalized video recap. *Explored, rejected: not compelling enough as a concept.*

### Activation & Onboarding
24. **AI new member onboarding journey** — Personalized first-30-day product onboarding. *Explored as part of Curo Companion.*
25. **Curo AI Companion for first 60 days** — Conversational AI guiding new members through goal setting, format discovery, check-ins, milestones. *Extensively developed, later felt it wouldn't demo well enough for hackathon — the value is in the relationship over time, hard to show in 2 minutes.*
26. **AI renewal moment** — Personalized pack value summary at expiry. *Explored but not shortlisted.*
27. **AI membership pause counselor** — Smart cancellation flow with AI conversation. *Explored but not shortlisted.*

### Operations & Internal
28. **AI "Centre Command" — real-time ops dashboard** — Air traffic control for centre managers. *Explored as a dark horse option.*
29. **AI "What's Happening at Cult Right Now"** — Live network visualization across all centres. *Explored but not shortlisted.*
30. **AI coach copilot** — Pre-class briefing for trainers (who's new, who's returning, class composition). *Explored but not shortlisted.*
31. **AI dynamic class creator** — Propose new classes based on demand signals. *Explored but not shortlisted.*

### Other
32. **"Bring a Friend" social loop with AI matching** — Personalized friend invites to specific classes. *Explored but not shortlisted.*
33. **AI centre personality page** — AI-generated vibe profile for each centre. *Explored but not shortlisted.*
34. **AI Cult challenges** — Auto-generated personal and group challenges. *Explored but not shortlisted.*

---

## Finalized Idea: Cult Pulse

### See What Your Workouts Are Actually Doing

**One-line summary:** Cult Pulse is an AI-powered progress perception engine that makes every workout's impact visible — through a living body map, personalized training load, and science-backed insights from Curo.

### The Problem

Members put in the work but can't see the results. The reward for fitness — visible body change, strength gains, weight loss — takes weeks or months to appear. But the effort is today. This perception gap kills motivation and drives churn.

Existing solutions show stats and streaks, but numbers don't create the *feeling* of progress. "You burned 400 calories" is abstract. "You attended 12 classes this month" is a fact, not a feeling. Members need to *see and feel* that today's session mattered.

### The Insight

You don't need to accelerate results. You just need to make the progress that's already happening *visible*. Every session moves the needle on multiple dimensions — but today the app treats a completed class as a binary event (done/not done). That's like Duolingo showing a list of completed lessons instead of a skill tree, XP bar, and streak counter.

### The Solution — Three Layers

#### Step 0: Goal Setting + Holistic Plan
Member sets their goal (weight loss, build strength, general fitness, stress relief, etc.). AI generates a holistic plan:
- Workout plan (formats, frequency, intensity)
- Nutrition targets (calories, protein intake)
- Sleep recommendation
- Water intake
- For weight loss: calorie deficit target with intake vs burn breakdown

This plan becomes the foundation that all three layers reference.

#### Layer 1: The Pulse Map (Body Visualization)
A visual human body where muscle groups glow based on recent activity.

- After each class, the muscles worked light up — color-coded by intensity
- Different formats map to different muscle groups (HRX = quads, core, shoulders; Yoga = hip flexors, lower back, hamstrings; Boxing = arms, shoulders, core; etc.)
- Over time, the whole body fills in as the member diversifies their workouts
- **The decay mechanic:** When a member goes inactive, the glow fades gradually. Cardiovascular indicators fade faster (1-2 weeks), strength indicators fade slower. The body visually "cools down" — creating visceral, loss-aversion-driven motivation to return
- This is the hero feature and primary demo moment

#### Layer 2: Training Load Score
A weekly effort score that tells members whether they're doing enough for their goal.

- Calculated from class format intensity × duration (no wearable needed — Cult already knows the intensity profile of every format)
- Format-to-intensity mapping: HRX = 8, Boxing = 7, S&C = 7, Burn = 6, Dance = 5, Yoga = 3, etc.
- Weekly view showing daily load stacking up against a target range
- Curo contextualizes: "You're at 17 this week. Target range for your goal: 15-20. Right in the zone." Or: "You're at 8 with 3 days left. One more session gets you to your target range."

#### Layer 3: Goal Progress (Week-over-Week Tracking)
Tracking achievement against the personalized plan, different for each goal type:

- **Weight loss:** Calorie balance trending (estimated intake vs burn), weekly trajectory
- **Strength:** Format consistency, session frequency, load progression
- **General fitness:** Overall consistency, format diversity, training load trend

Curo provides contextualized encouragement, especially when progress stalls:
- Plateaus: "Your weight hasn't changed but your training load has increased — you're likely gaining muscle while losing fat"
- Non-linear progress: "Progress isn't a straight line. Your 4-week trend is still moving in the right direction"
- Cycle-awareness (for women): "Weight fluctuations of 1-2kg during your cycle are completely normal and not fat gain"
- Reframing: "Progress isn't always on the weighing scale — your consistency, endurance, and strength are all improving"

#### Bonus: Progress Photos (Mockup for Demo)
- Guided photo capture with silhouette overlay for consistent framing
- Week-over-week side-by-side comparison
- AI-generated time-lapse of gradual transformation
- *Note: shown as design mockup in demo, built as future scope*

### Curo's Role — The AI Character

Curo is Cult.fit's existing streak mascot (purple character, already on the app), now extended into a conversational AI companion.

**Persona:** Smart Buddy — warm, direct, a little cheeky. Talks like a friend who happens to know everything about fitness and exercise science.

**How Curo sounds in Cult Pulse:**
- Post-HRX: "That session hit your quads, core, and shoulders hard. Your heart rate was likely in zone 3-4 for most of it, building cardiovascular endurance. Right now your muscles are in a repair cycle — they'll be rebuilding stronger for the next 24-36 hours. A protein-rich meal in the next 2 hours will maximize that."
- Post-Yoga: "This one worked differently — you stretched and lengthened muscles that were tight from your HRX on Tuesday. Your hip flexors and lower back got much-needed mobility work. This is the kind of session that prevents injury and helps your strength sessions perform better."
- After inactivity: "It's been 8 days since your last session. The cardiovascular gains from your last few weeks are starting to taper — your body loses aerobic fitness faster than strength. A single session this week would be enough to reverse that curve."
- Milestone: "3 sessions in week one — the excuses list is staying short, I see."

**Curo does NOT:**
- Use excessive emojis or say "let's gooo! 🔥💪"
- Make self-referential AI jokes
- Guilt-trip about missed sessions
- Use generic motivational clichés
- Negatively characterize Cult's classes, centres, coaches, or formats (can steer toward better experiences without framing any option as bad)

### Demo Flow (~2 minutes)

**Scene 1 — Goal Setting:** New member opens Cult Pulse, sets goal (weight loss), answers 2-3 questions. AI generates holistic plan.

**Scene 2 — The Pulse Map:** Member opens their body visualization. Some areas glowing from recent sessions, some faded. Curo narrates: "Your lower body is strong this month. Your upper body hasn't been touched in 2 weeks — it's starting to cool off."

**Scene 3 — Post-Session Update:** Member completes an HRX class. Body map updates live — quads, core, shoulders light up. Curo provides science-based insight on what the session did.

**Scene 4 — Training Load:** Show weekly training load at 17 out of target 15-20. Curo: "Right in the zone this week."

**Scene 5 — The Decay (Demo Highlight):** Time-lapse simulation of 2 weeks of inactivity. Body map gradually fades. Curo narrates the science: "Your aerobic base is declining. One session reverses the curve." Then show the contrast — what the body looked like when active vs now.

**Scene 6 — Goal Progress:** Show 4-week goal progress view (pre-built with mock data). Weight trend, calorie balance, consistency score. Curo contextualizes any plateau.

**Scene 7 — Progress Photos (Mockup):** Show the guided capture UI and side-by-side comparison design. Mention as "coming next."

### What's Built vs Mocked vs Pitched

| Component | Hackathon Status |
|-----------|-----------------|
| Goal setting flow (3-4 screens) | Built |
| Pulse Map body visualization with glow + decay | Built (hero feature) |
| Training load score with weekly view | Built |
| Curo post-session science insight (via LLM API) | Built |
| Curo motivator messages (plateau, cycle, etc.) | Built |
| Goal progress week-over-week view | Static mockup (pre-built for one member) |
| Progress photos side-by-side | Static mockup (show UI design) |
| Holistic plan (diet, sleep, water, protein) | Pitch deck — future scope |
| Progress photo time-lapse | Pitch deck — future scope |
| Cycle-aware insights | Pitch deck — future scope |
| Integration with existing streaks/M1 journey | Pitch deck — future scope |

### 24-Hour Build Plan

#### Phase 1: Foundation (Hours 0-4, 10AM-2PM)
- Set up project (React via Replit/Cursor)
- Build app shell with navigation between screens
- Create mock member data file (one member, 4-week history)
- Define format-to-muscle-group mapping
- Define format-to-intensity scoring
- Write Curo's system prompt

**Checkpoint:** Click through all screens, data layer solid.

#### Phase 2: Pulse Map (Hours 4-10, 2PM-8PM)
- Find/create SVG body illustration with muscle group zones
- Build glow mechanic (color/opacity driven by workout history)
- Build decay animation (time-lapse of fading over 2 weeks)
- Style it (dark background matching Cult's aesthetic, neon glow)
- Post-session update animation

**Checkpoint:** Pulse Map looks stunning, decay animation works. This is 60% of the demo.

#### Phase 3: AI Layer + Training Load (Hours 10-16, 8PM-2AM)
- Wire up LLM API for Curo's post-session insights
- Test with 5+ different class scenarios
- Build motivator messages for edge cases
- Build Training Load screen (weekly bar chart with target range)
- Connect training load to goal context

**Checkpoint:** Full loop works — session → body map update → Curo insight → training load.

#### Phase 4: Goal Setting + Goal Progress (Hours 16-20, 2AM-6AM)
- Build goal setting flow (3-4 interactive screens)
- Build static 4-week goal progress view for demo member
- Add progress photos mockup screen

**Checkpoint:** End-to-end flow works from goal setting to progress view.

#### Phase 5: Polish + Demo Prep (Hours 20-24, 6AM-10AM)
- Visual polish, transitions, loading states
- Curo avatar placement
- Future scope slides (2-3 slides)
- Write and rehearse demo script (3x minimum)
- Record backup demo video
- Buffer time

**Checkpoint:** Demo rehearsed, everything works, backup recorded.

### Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Body SVG takes too long | Find open-source anatomy SVG early. If nothing by hour 5, use stylized/abstract body silhouette |
| AI responses inconsistent | Include 3-4 example responses in system prompt. Test with 5+ scenarios before moving on |
| Running out of time | Pulse Map is the ONE thing that must look great. Drop goal progress to mockup slide if behind |
| API slow during live demo | Pre-record backup video of the full demo flow |

### Hackathon Theme Alignment

- **AI-Driven User Activity Insights** — directly (analyzing member behavior to drive actionable insights)
- **Growth & Retention Engines** — directly (solving progress perception to reduce churn)
- **AI Everywhere** — Curo as an AI companion providing science-backed, personalized insights after every session

### Submission Text

"Cult Pulse — an AI-powered progress perception engine that makes every workout's impact visible through a living body map, personalized training load, and science-backed insights from Curo. Solves the #1 reason members quit: they can't see their progress. Web/portal-based demo."

# Cult Pulse Demo

Static hackathon prototype for the Cult Pulse concept.

## Files

- `index.html`: app shell and screen structure
- `styles.css`: visual system and responsive styling
- `app.js`: mock data, pulse/decay logic, rolling training load, baseline comparison, and Curo copy

## Run locally on port 3000

From the repo root at [pulse_hackathon26](/Users/nikhil.kulkarni/Desktop/Work/96%20Hackathon/pulse_hackathon26):

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

The server redirects to the mockup entry at `/01%20Mockup/` so the current asset paths continue to work unchanged.

## Demo actions

- Go through `Goal setup` to personalize the 7-day target
- Open `Pulse Map` and click `Complete HRX session`
- Click `Simulate 14 days inactive` to show decay
- Open `Training Load` to show how rolling load, baseline context, and confidence change
- End on `Future scope` for mocked progress views

# Human Operations agent orchestration

The Mission Director is the central coordinator. It builds a short, fictional learning scene and passes only mission-scoped evidence to four bounded roles:

1. **Scene Director** frames the cinematic context and objective.
2. **Evidence Guide** points learners to observable cues without providing instructions for accessing real systems.
3. **Safety Reviewer** checks that the scenario stays defensive, fictional, and age-appropriate.
4. **Debrief Writer** explains the reasoning behind a safe answer and suggests the next learning mission.

The API starts with deterministic placeholder roles so it works without an AI key. A future provider adapter should run behind the Mission Director, receive a narrow scenario object, keep no credentials, and reject requests outside the educational sandbox.

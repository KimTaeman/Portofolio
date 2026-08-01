# Journey to the Summit — Next Steps

## Current status

The project is a functional continuous-scrollytelling prototype. The character now travels through a vertically and spatially connected Playground, Campus, Mountain, and Summit rather than jumping between isolated scene stops.

`npm run lint` and `npm run build` pass. The production build still reports a JavaScript bundle-size warning.

## Completed foundation

- Vite, React 19, Tailwind CSS, React Three Fiber, Drei, and Framer Motion are configured.
- The 2D overlay is mounted in a root-level fixed layer above the canvas with pointer-event passthrough.
- One shared `narrativeTimeline.js` defines scene ranges, character keyframes, the Mountain S-curve/bridge profile, camera keyframes, overlay timing, and Summit look-around limits.
- Scene ranges match the concept document: Playground `0–20%`, Campus `20–50%`, Mountain `50–82%`, and Summit `82–100%`.
- A single `JourneyCharacter` slides, falls into Campus, walks left-to-right, changes outfits, hikes the Mountain, and reaches the Summit at `90%`.
- Camera staging includes the Playground swoop, Campus side tracking shot, curve-aware Mountain follow, and final Summit panorama.
- The Summit supports a continuous 360-degree orbit view, upward tilt, and mobile-safe vertical scrolling.
- Scene 3 now uses a measured stone-and-forest transition corridor into a deeply isolated faceted S-curve trail, waterfall chasm, suspension bridge, dense flora, and six gently bobbing project balloons with proximity-driven cards.
- The current procedural art pass uses rounded chibi geometry, high-roughness clay materials, warm studio/outdoor lighting, shadows, atmospheric depth, and bold overlay typography.
- Scene 1 includes an opening wave, seated slide pose, accelerated fall, airborne pose, squash-and-hop landing, reverse-scroll behavior, and transition into the Campus walk.
- The Summit has alpine edge dressing, a translucent moving cloud sea, animated mist, high drifting clouds, flapping birds, an oversized sunset behind massive peaks, an articulated three-phase victory/shielding sequence, a 360-degree orbit, and a minimizable icon-based contact HUD.

## Known prototype limitations

- Portfolio name, biography, project details, contact information, and real links are still placeholders or missing.
- The procedural character and environments are art-direction prototypes, not approved production models.
- Campus detail-card copy uses provisional, non-personal content until approved portfolio details are supplied.
- Four of the six Mountain project cards still use placeholder titles and descriptions.
- Summit scenery follows the confirmed procedural soft-clay direction and still needs browser-level composition tuning.
- Reduced-motion behavior and a complete keyboard interaction pass are still outstanding.
- `scrollOffset` is currently mirrored into React state frequently for the DOM overlay and should be profiled.
- The production JavaScript bundle is over Vite's default warning threshold.
- A full browser/device visual regression pass has not been documented yet.

## Immediate next priorities

### 1. Visual regression and motion tuning

- Run the experience in supported desktop and mobile browsers.
- Record or capture the key beats at `0%`, `10%`, `20%`, `46%`, `50%`, `60%`, `70%`, and `90%`.
- Tune clipping, character scale, camera lag, tracking composition, and reverse-scroll transitions using those captures.
- Verify Summit mouse drag, touch horizontal exploration, upward tilt, and vertical-scroll escape behavior.

### 2. Consolidate reusable canvas primitives

- Extract the repeated clay material configuration into a reusable primitive or shared material strategy.
- Extract repeated rounded trail steps, foliage clusters, and shadow flags where this reduces duplication.
- Define documented palette, roughness, scale, and lighting tokens for every scene.
- Profile whether repeated foliage should use shared geometry/materials or instancing.

### 3. Scene 1 — Playground (implementation complete; content pending)

- [x] Add the opening wave, controlled slide pose, fall pose, landing squash/hop, and transition into the Campus walk.
- [x] Refine the slide rails, cliff silhouette, and landing occlusion so the outfit swap reads clearly.
- [ ] Replace placeholder introduction copy after the real name and biography are supplied.
- [ ] Complete the browser capture/tuning pass listed in Priority 1.

### 4. Finish Scene 2 — Campus (implementation complete; content pending)

- [x] Add clickable easel, badminton, and technical-laptop landmarks, keeping the side-tracking path clear.
- [x] Add concise DOM detail cards with a close control, initial focus, Escape dismissal, and backdrop dismissal; lock scrolling while a card is open.
- [x] Add sparse falling-blossom particles and background trees without filling the character's travel lane.
- [x] Centralize the University outfit threshold at `20%`, placing the transition behind the first Campus blossom tree at the Scene 1 boundary.
- [ ] Replace the provisional card copy and example skill labels with approved portfolio information.
- [ ] Complete the browser capture/tuning pass listed in Priority 1, including Campus landmark hit targets and outfit occlusion.

### 5. Finish Scene 3 — Adventure projects

- [x] Replace the straight slope with a winding S-curve, low-poly cliffs, a waterfall chasm, a suspension bridge, flora, and distant scenic motion.
- [x] Make the character and trailing camera follow the same shared path profile through forward and reverse scrolling.
- [x] Replace the temporary single-project prompt with six trail-side balloons, each carrying a locally attached proximity-driven project card.
- Supply the four remaining project titles, descriptions, links, and approved imagery.
- Tune the project array for narrow screens and provide an accessible DOM equivalent if the final cards become interactive.
- Complete a browser capture pass at the trail entrance, bridge midpoint, waterfall reveal, and Summit handoff.

### 6. Finish Scene 4 — Summit and contact

- [x] Add the three-phase victory/survey/shielding sequence, alpine dressing, rocky peak, rolling mist, moving cloud layers, birds, sunset, and deep-background vista.
- [x] Add continuous 360-degree summit orbit controls with a ground-safe vertical limit.
- [x] Replace the telescope concept with a minimizable cinematic contact HUD and direct contact actions.
- Add real contact calls to action and links.
- Polish day/night differences, including stars, lights, and contrast.

### 7. Production assets and loading

- Inventory and approve character variants, environment models, project imagery, icons, and audio.
- Put approved 3D assets in `public/models/`, optimize them, and load them with `useGLTF`.
- Add Suspense/loading and error states plus preloading for critical assets.
- Compress geometry and textures before integration and document attribution/licenses.

### 8. Accessibility, responsiveness, and performance

- Add `prefers-reduced-motion` behavior for parallax, camera damping, and procedural limb motion.
- Complete focus, keyboard, screen-reader, contrast, and pointer-target checks.
- Test portrait phones, landscape phones, tablets, laptops, and wide desktop displays.
- Profile render-loop work, React updates, shadows, geometry counts, and draw calls.
- Code-split noncritical UI/assets and address the production bundle warning.

### 9. Validate and ship

- Perform forward/backward scroll regression across all scene and interaction boundaries.
- Test current Chrome, Firefox, Safari, and Edge on representative desktop and mobile devices.
- Run lint/build checks from a clean checkout.
- Configure production deployment, metadata, analytics/privacy decisions, and error monitoring.

## Decisions and content still needed

- Real portfolio name, biography, skills, hobbies, projects, experience, contact details, and links.
- Whether the procedural character/environment style is the final production direction or a placeholder for GLTF assets.
- Approved project imagery and asset licenses.
- Final telescope/contact behavior.
- Whether React 19 is intentionally retained; no dependency change should be made without confirmation.

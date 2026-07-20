# Journey to the Summit — Next Steps

## Current status

The project is a functional continuous-scrollytelling prototype. The character now travels through a vertically and spatially connected Playground, Campus, Mountain, and Summit rather than jumping between isolated scene stops.

`npm run lint` and `npm run build` pass. The production build still reports a JavaScript bundle-size warning.

## Completed foundation

- Vite, React 19, Tailwind CSS, React Three Fiber, Drei, and Framer Motion are configured.
- The 2D overlay is mounted in a root-level fixed layer above the canvas with pointer-event passthrough.
- One shared `narrativeTimeline.js` defines scene ranges, character keyframes, camera keyframes, overlay timing, the Mountain interaction range, and Summit look-around limits.
- Scene ranges match the concept document: Playground `0–20%`, Campus `20–50%`, Mountain `50–70%`, and Summit `70–100%`.
- A single `JourneyCharacter` slides, falls into Campus, walks left-to-right, changes outfits, hikes the Mountain, and reaches the Summit at `90%`.
- Camera staging includes the Playground swoop, Campus side tracking shot, rear Mountain follow, continued Summit climb, and final rear-view panorama.
- The Summit supports a constrained 180-degree drag view, upward-only tilt, and mobile-safe vertical scrolling.
- The Mountain project prompt uses a testable trigger/reset range, explicit dismissal, Escape support, and re-arm behavior.
- The current procedural art pass uses rounded chibi geometry, high-roughness clay materials, warm studio/outdoor lighting, shadows, atmospheric depth, and bold overlay typography.
- Scene 1 includes an opening wave, seated slide pose, accelerated fall, airborne pose, squash-and-hop landing, reverse-scroll behavior, and transition into the Campus walk.
- Day/night Summit presentation, distant peaks, clouds, and placeholder city lights are present.

## Known prototype limitations

- Portfolio name, biography, project details, contact information, and real links are still placeholders or missing.
- The procedural character and environments are art-direction prototypes, not approved production models.
- The final Summit confidence pose is not yet implemented as a distinct animation.
- Campus hobby/skill props do not yet open real accessible detail cards.
- The Mountain Polaroid is still a temporary project prompt rather than a project gallery.
- The telescope currently has no purposeful contact interaction.
- Summit scenery is procedural and needs a visual-quality pass using approved assets or a confirmed procedural direction.
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

### 4. Finish Scene 2 — Campus

- Build the approved hobby landmarks and technical-skill laptop presentation.
- Add concise accessible DOM cards with close buttons, focus management, and keyboard support.
- Refine blossom particles and background props without obscuring the side tracking shot.
- Confirm the University outfit design and swap timing behind the blossom tree.

### 5. Finish Scene 3 — Mountain projects

- Supply real project/experience content and approved imagery.
- Replace the temporary prompt with an accessible Polaroid/project gallery.
- Add the retro-camera pull/flash beat at approximately `60%`.
- Verify dismissal, reverse entry, repeated entry, and scroll re-arming with pointer and keyboard input.
- Refine the boulder occlusion and Hiker outfit transition.

### 6. Finish Scene 4 — Summit and contact

- Refine the final climb and confident rear-facing summit pose.
- Decide whether the procedural vista is final or should be replaced with optimized production assets.
- Turn the telescope into an accessible contact interaction or remove it.
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

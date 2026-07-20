# Journey to the Summit — Next Steps

## Current status

The project has a functional prototype foundation. `npm run lint` and `npm run build` both pass as of this review (the production build reports a JavaScript bundle-size warning only).

## Completed milestones

- Vite, React, Tailwind CSS, React Three Fiber, Drei, and Framer Motion are installed and configured.
- A full-viewport R3F canvas uses four pages of scroll-driven navigation.
- The four narrative locations are represented by separate canvas scene components: Playground, Campus, Mountain, and Summit.
- Camera movement interpolates between defined position, look-target, and field-of-view stops in both scroll directions.
- Initial scene behaviors exist: a playground slide animation, uniform-to-hiker state change, a Mountain interaction lock zone with a polaroid prompt, and a day/night summit toggle.
- A dedicated `UIOverlay` component contains draft copy, scene selection, opacity ranges, and Framer Motion transitions.

## Task 1 — Fix the missing 2D UI text overlay

**Priority: immediate. Do this before additional feature work.**

- Reproduce the issue in the browser and inspect whether `UIOverlay` is mounted and receiving changing `scrollOffset` values.
- Correct its stacking/positioning context so the text is visibly rendered above the WebGL canvas at every relevant scroll position. Keep 2D UI in a root-level fixed container, outside the transformed `Scroll` HTML content.
- Verify all four text states appear and fade in/out at their intended scroll ranges on desktop and mobile widths.
- Preserve pointer-event passthrough so the overlay does not block canvas scrolling or scene interactions.

**Done when:** the first scene’s text is visible on load and each scene’s text reliably transitions as the user scrolls forward and backward.

## Remaining technical roadmap

### 2. Align the narrative timeline

- Map each scene’s physical placement to its camera stop and overlay range.
- Tune camera positions, look targets, and timing so each location enters frame cleanly.
- Replace the current narrow interaction lock zone with an intentional, testable trigger range and exit behavior.

### 3. Establish reusable scene primitives

- Extract repeated material/geometry choices into small reusable canvas components where it improves consistency.
- Add a shared ground/path treatment so transitions between locations feel continuous.
- Define a lightweight palette, lighting rules, and scale conventions for all four scenes.

### 4. Finish Scene 1 — Playground introduction

- Refine the opening composition and slide animation for a clear first impression.
- Replace the placeholder character block with the chosen character asset or a deliberately styled low-poly version.
- Finalize the introduction copy and its placement against the scene.

### 5. Finish Scene 2 — Campus skills and hobbies

- Turn the campus placeholders into visual skill/hobby landmarks.
- Add concise, accessible UI content for each selected skill or hobby.
- Add only the interactions needed to reveal that content, then verify they work with scrolling.

### 6. Finish Scene 3 — Mountain experience

- Define the actual experience/project content shown by the mountain path and polaroid.
- Replace the temporary polaroid prompt with a styled, accessible project detail card.
- Finalize the outfit transition and ensure the scroll lock can always be dismissed with pointer and keyboard input.

### 7. Finish Scene 4 — Summit/contact

- Refine the summit environment and day/night presentation.
- Make the telescope a purposeful interaction or remove it if it does not support the story.
- Add final contact calls to action with real, keyboard-accessible links.

### 8. Add production assets and loading behavior

- Inventory the models, textures, icons, and portfolio imagery needed for the approved design.
- Place approved 3D assets under `public/models/` and load them with `useGLTF`.
- Add loading/error handling and preloading for large assets; optimize model and texture sizes before integration.

### 9. Polish motion, performance, and responsiveness

- Audit `useFrame` callbacks and avoid unnecessary React state updates during animation.
- Test camera and UI composition at mobile, tablet, and desktop breakpoints.
- Add reduced-motion behavior and ensure color contrast, focus states, and semantic controls meet accessibility expectations.
- Address the current production bundle-size warning after the content and asset approach are finalized.

### 10. Validate and ship

- Perform a forward/backward scroll regression pass, including every interaction and overlay transition.
- Run lint and production build; fix any new warnings or errors.
- Test the deployed build on supported browsers and devices, then configure the production deployment.

## Project decisions still needed

- The `concept-document.md` file is empty, so final visual direction, portfolio copy, real projects, links, and asset selections still need to be supplied or approved before the corresponding implementation tasks begin.
- The current project uses React 19, while the written requirements state React 18+. Confirm whether React 19 is intentional before making dependency changes.

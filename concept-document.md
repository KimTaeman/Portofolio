# The Journey to the Summit
*A Narrative 3D Portfolio Concept*

---

## 🧭 Core Concept

This portfolio is a **scrollytelling experience**. The user's scroll controls the flow of time, moving a 3D character along a continuous path that represents your personal and professional journey.

* **Aesthetic:** "Soft 3D" or "Stylized Clay." Characterized by warm pastel colors, matte surfaces, simple geometric shapes, and soft, diffuse lighting (no harsh shadows).
* **Key Metaphor:** Life as a climb. Starting from playful curiosity (playground), moving through learning (campus path), overcoming challenges (mountain climb), and reaching a confident future (summit).

---

## 🎬 Detailed Scene Breakdown

### Scene 1: The Playground (Introduction)
* **Scroll Range:** `0% - 20%`
* **The World:** A stylized, "soft 3D" playground. The look is matte, clean, and warm. Features a simple orange slide, soft green "gumdrop" trees, and a cream-colored ground.
* **Character & Action:**
  * **Start (0%):** Character is a stylized "chibi" figure in a **school uniform**, sitting at the top of the slide, waving.
  * **Action (0% - 10%):** On scroll, the character stops waving and **slides down**. The camera performs a dynamic swoop to follow.
  * **Landing (10% - 20%):** Character lands with a playful hop and begins a walking loop toward the path.
* **Key Interaction (The Growth Morph):** As the character walks *behind* a large tree or playground structure, the model instantly **swaps** from School Uniform to University Uniform.
* **Copy (HTML Overlay):** 
  > "Hi, I'm [Your Name]! Welcome to my world. I'm a developer who believes every great project starts with curiosity."

---

### Scene 2: The Campus Path (Skills & Hobbies)
* **Scroll Range:** `20% - 50%`
* **The World:** A University Campus Path lined with "soft 3D" **cherry blossom trees** (simple trunks, pink cloud-like petals). Gentle falling petal particles fill the air.
* **Character & Action:** Character is in a **university uniform**, walking or lightly jogging along the path with a focused, steady pace. Camera follows in a smooth tracking shot.
* **Interactions:**
  * **Hobbies (Fun):** Interactive 3D items along the path (Easel, Badminton Racket). Clicking them opens small 2D cards with personal details.
  * **Skills (Technical):** A **laptop** on a bench. Clicking it opens a clean 2D modal listing technical skills (Languages, Frameworks, Databases).
* **Copy (HTML Overlay):** 
  > "I spent my time learning, growing, and building my foundation."

---

### Scene 3: The Mountain Base (Experience & Projects)
* **Scroll Range:** `50% - 70%`
* **The World & Character:**
  * **World:** Base of a stylized, low-poly mountain with a steeper "zigzag" trail.
  * **Morph 2:** Model swaps from University Uniform to **Hiker/Explorer Outfit** behind a large boulder.
  * **Camera:** Shifts to follow *behind* the character and tilts up, emphasizing the height of the mountain.
* **Key Interaction (The Retro Camera):**
  * At a scenic overlook (~60% scroll), the **scroll pauses**.
  * Character pulls out a **3D retro camera**.
  * Camera "flashes," and 2D **Polaroid images** (your previous projects/experience) fly out.
  * User clicks Polaroids to read details. Closing them "unlocks" the scroll.
* **Copy (HTML Overlay):** 
  > "I put my skills to the test. Here's what I've built and where I've been."

---

### Scene 4: The Summit (Future & Contact)
* **Scroll Range:** `70% - 100%`
* **The World:** A rugged soft-clay rock crown dressed with alpine grass, loose stone, and small edge pines above a translucent sea of clouds and slowly rolling mist. Massive blue-gray peaks and a glowing sunset sit deep beyond the climb.
* **Camera Payoff (The Reveal):** As the character reaches the peak, the camera swings into a rear hero view that frames the character against the vista. A timed performance raises both arms in victory, surveys the landscape, and settles into a relaxed hand-behind-head pose with calm breathing. The user can then orbit continuously around the summit through 360 degrees.
* **Interactions:**
  * **Day/Night Toggle:** A ☀️/🌙 icon swaps the lighting. Night mode features a starry sky and glowing city lights below.
  * **Contact CTA:** A compact, minimizable glass HUD appears at the bottom-left after the summit camera settles, exposing icon-based Email, GitHub, and LinkedIn actions without blocking the character or orbit view.
* **Copy (HTML Overlay):** 
  > "Ready to conquer the next challenge."

---

## 🎨 Design Specifications

### Color Palette (Soft 3D)
* **Warm Cream:** `#FDF6E3` (Ground & background warmth)
* **Soft Orange:** `#FFB380` (Slide, highlights, accents)
* **Calm Blue:** `#AEC6CF` (Sky, uniform accent)
* **Cherry Pink:** `#FFB7C5` (Blossom foliage)
* **Pine Green:** `#77DD77` (Playground trees & mountain foliage)

### Typography
* **Primary Font:** Inter / Poppins (Clean, high legibility for 2D HTML overlays)

### Master 3D Asset List

| Asset Name | Type | Required Animations |
| :--- | :--- | :--- |
| `character_school.gltf` | Character | Idle (Waving), Slide_Down, Walk_Loop, Jump/Land |
| `character_university.gltf` | Character | Walk_Loop, Jog_Loop |
| `character_hiker.gltf` | Character | Hike_Loop (Uphill), Pull_Camera, Idle_Confident |
| `playground_scene.gltf` | Environment | Static (Optional: gently swaying swings) |
| `campus_path.gltf` | Environment | Static path geometry |
| `mountain_base.gltf` | Environment | Static terrain |
| `summit_peak.gltf` | Environment | Static platform |
| `cherry_tree_var[1-3].gltf` | Prop (Repeated) | None |
| `hobby_easel.gltf` | Interactive Prop | Hover_Glow |
| `hobby_racket.gltf` | Interactive Prop | Hover_Glow |
| `laptop.gltf` | Interactive Prop | Hover_Glow |
| `retro_camera.gltf` | Prop (Held) | None (Animation on character arm) |
| `telescope.gltf` | Interactive Prop | Hover_Glow |

---

## ✅ Full Project Checklist

### Phase 1: Pre-Production & Design
- [ ] **Create Moodboard:** Collect all reference images (David portfolio, soft clay examples) in Figma/Pinterest to lock in aesthetic.
- [ ] **Define Color Palette:** Lock in HEX values for ground, sky, plants, and accent UI.
- [ ] **Storyboard Scenes:** Sketch rough wireframes of the 4 key camera angles.
- [ ] **Design 2D UI Elements:** Mockup HTML overlays for Hobby cards, Skills laptop screen, Polaroid gallery, and Contact form in Figma.

### Phase 2: 3D Asset Creation
- [ ] **Model Characters & Animations:** Create 3 character variations (School, Uni, Hiker) and export animations.
- [ ] **Model World Scenes:** Build Playground, Campus Path, and Mountain Peak in Spline/Blender.
- [ ] **Model Interaction Props:** Create Easel, Racket, Laptop, Camera, and Telescope.
- [ ] **Export & Optimize:** Export all models as `.gltf` / `.glb` and compress textures.

### Phase 3: Technical Setup
- [ ] **Initialize Git Repo:** Set up a new GitHub repository for version control.
- [ ] **Scaffold Vite Project:** Run `npm create vite@latest my-portfolio -- --template react`.
- [ ] **Install R3F Dependencies:** Install `@react-three/fiber`, `@react-three/drei`, and `react-spring`.
- [ ] **Set Up Project Structure:** Create folder hierarchy (`/components/Scenes`, `/components/UI`, `/models`).

### Phase 4: Development
- [ ] **Scene 1 (The Slide):** Set up main `<Canvas>` and `<ScrollControls>`. Link scroll to slide animation and text overlay.
- [ ] **Scene 2 (Path & Hobbies):** Animate camera along path. Build model swap behind tree. Add clickable hobby props and Laptop modal.
- [ ] **Scene 3 (Retro Camera):** Code scroll pause at viewpoint. Trigger camera pull animation, flash effect, and 2D Polaroid gallery overlay.
- [x] **Scene 4 (Summit & Contact):** Animate the summit reveal, multi-phase character performance, Day/Night presentation, 360-degree orbit, and minimizable contact HUD.

### Phase 5: Launch
- [ ] **Performance Optimization:** Add `<Suspense>` loading screen and compress models for smooth 60fps.
- [ ] **Mobile Responsiveness Check:** Ensure 2D HTML overlays fit mobile screens.
- [ ] **Final Deployment:** Deploy project repository to Vercel or Netlify.

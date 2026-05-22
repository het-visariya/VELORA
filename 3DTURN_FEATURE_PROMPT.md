# VELORA — 3D Turn Feature Prompt
## For: Frontend/3D Agent (Three.js + GLB Rendering + Poetry + Closet Try-On)

---

## Section 1: Gender Analysis via Poem

**Display this poem to the user:**

> *"Before we begin your 3D turn, let's set the stage with a poem. Read the lines below and let your style speak through them — then tell us, are you a him or a her?"*
>
> *In fabrics woven, threads of dreams take flight,*  
> *A silhouette emerges in the morning light.*  
> *Sharp lines or curves, a story to unfold,*  
> *A presence felt — confident, bold.*  
> *Every stitch a whisper, every drape a tale,*  
> *Tell me now — do you wear the veil?*

**After the user reads/completes the poem, prompt them to select or confirm their gender.** Store the result as `userGender` ("male" or "female").

---

## Section 2: Load 3D Model Based on Gender

**Logic:**

```js
if (userGender === "male") {
  modelUrl = "/models/boy3D.glb";
} else if (userGender === "female") {
  modelUrl = "/models/girl3D.glb";
}
```

**3D Turn Controls:**
- Auto-rotate on load (slow Y-axis spin)
- User can click-and-drag to rotate manually (OrbitControls)
- Zoom in/out via scroll wheel (min 1.5, max 5)
- Reset view button
- Loading spinner while GLB streams (~15MB)

**Lighting (cinematic, dark luxury aesthetic):**
- Ambient light (0xffffff, 0.4)
- Warm key light (0xfff5e0, 1.8) from upper-right
- Rim light matching Velora gold accent (0xC5A880, 0.6) from rear-left
- Fill light (0xffffff, 0.3) from front

---

## Section 3: Try-On Clothes from Closet

**After the base model loads, show a "Your Closet" panel** with the user's saved clothing items (fetched from `GET /closet`).

**Try-On Logic:**
1. User clicks a clothing item from their closet.
2. The item (GLB or mesh) loads and attaches to the corresponding bone on the base model armature.
3. If another item occupies that slot, swap it out.
4. Camera stays in 3D Turn mode — user can spin to see the outfit from all angles.

**Closet UI layout:**

| Category   | Examples                |
|------------|-------------------------|
| Tops       | T-Shirt, Jacket, Hoodie |
| Bottoms    | Jeans, Shorts, Skirt    |
| Footwear   | Sneakers, Boots, Sandals|
| Full Body  | Dress, Jumpsuit         |

**Visual feedback:** Highlight selected item. Show "Remove" button to strip it off.

---

## Implementation Notes

- Use **Three.js** with `@react-three/fiber` (or vanilla Three.js + GLTFLoader).
- Import models via `useGLTF("/models/boy3D.glb")` / `useGLTF("/models/girl3D.glb")`.
- Enable `OrbitControls` for manual rotation.
- Auto-rotate: `useFrame((state) => (ref.current.rotation.y += 0.005))`.
- Attach clothing by referencing the skeleton's bone hierarchy.
- All clothing GLBs must be rigged to match the base model's armature.

**Existing model paths:**
- `backend/public/models/boy3D.glb` (~15 MB)
- `backend/public/models/girl3D.glb` (~12.8 MB)

Both confirmed valid GLTF 2.0 binary files.

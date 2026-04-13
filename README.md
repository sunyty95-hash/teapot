# Teapot Viewer

An interactive **WebGL-based 3D teapot viewer** built with HTML and GLSL shaders. It renders the classic [Utah Teapot](https://en.wikipedia.org/wiki/Utah_teapot) and provides real-time controls for adjusting the camera projection and object rotation.

---

## Dependencies

This file relies on several external scripts that must be present in the same directory:

```
project/
├── teapot.html
├── teapot.js                  # Teapot geometry/mesh data
├── teapotTransform.js         # Transformation logic and WebGL setup
├── xform2.js                  # Additional transform utilities
└── common_files/
    ├── utils.js               # General WebGL utilities
    ├── initShaders.js         # Shader compilation and initialization
    └── mat_vec.js             # Matrix and vector math library
```

---

## Usage

Open `teapot.html` in a **WebGL-compatible browser** (Chrome, Firefox, Edge, Safari). No build step or server is required — it runs directly in the browser.

> **Note:** Some browsers may block local JavaScript file imports. If the canvas appears blank, try serving the files through a simple local server:
> ```bash
> python -m http.server 8000
> ```
> Then navigate to `http://localhost:8000/teapot.html`.

---

## Controls

All controls are sliders on the page below the canvas:

| Control | Range | Default | Description |
|---|---|---|---|
| **Window Width** | 0.1 – 30.0 | 5.0 | Horizontal size of the projection window |
| **Window Height** | 0.1 – 30.0 | 5.0 | Vertical size of the projection window |
| **Near Clipping Plane** | 0.1 – 200 | 6.0 | Distance to the near clip plane; current value displayed live |
| **Far Clipping Plane** | 0.1 – 300 | 300 | Distance to the far clip plane |
| **Rotate X** | -90° – +90° | 0° | Rotates the teapot along the X axis |
| **Rotate Y** | -90° – +90° | 0° | Rotates the teapot along the Y axis |
| **Rotate Z** | -90° – +90° | 0° | Rotates the teapot along the Z axis |

---

## Shaders

The page includes inline GLSL shaders:

**Vertex Shader**
Applies a standard MVP (Model-View-Projection) transform using three uniform matrices:
- `M_model` — model/world transform
- `M_Camera` — view/camera transform
- `M_Persp` — perspective projection

**Fragment Shader**
Outputs the interpolated vertex color passed from the vertex shader. No lighting calculations are performed in the fragment stage.

---

## Requirements

- A modern browser with **WebGL support**
- All dependency scripts present (see [Dependencies](#dependencies) above)

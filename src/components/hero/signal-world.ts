import * as THREE from "three";
import { lerp } from "./opening-math";
import { SIGNAL } from "./signal-material";

export type SignalPose = {
  x: number;
  y: number;
  size: number;
  reveal: number;
  turn: number;
  hand: number;
  grip: number;
  crush: number;
  release: number;
};

/** Original split-shell artifact and articulated five-digit synthetic hand.
 * Orthographic stage coordinates let one physical object cross DOM sections
 * without a camera cut. All joints and shell fragments are reversible poses. */
export function createSignalWorld(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
  camera.position.z = 1200;
  let width = 1,
    height = 1,
    disposed = false;
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const geometry = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g);
    return g;
  };
  const material = <T extends THREE.Material>(m: T) => {
    materials.add(m);
    return m;
  };
  const shell = material(
    new THREE.MeshStandardMaterial({
      color: 0x252730,
      metalness: 0.55,
      roughness: 0.4,
    }),
  );
  const edges = material(
    new THREE.MeshStandardMaterial({
      color: 0x60616a,
      metalness: 0.85,
      roughness: 0.28,
    }),
  );
  const handMaterial = material(
    new THREE.MeshStandardMaterial({
      color: 0x292b33,
      metalness: 0.54,
      roughness: 0.38,
    }),
  );
  const jointMaterial = material(
    new THREE.MeshStandardMaterial({
      color: 0x0c0d13,
      metalness: 0.35,
      roughness: 0.57,
    }),
  );
  const energy = material(
    new THREE.MeshStandardMaterial({
      color: SIGNAL.dark,
      emissive: SIGNAL.red,
      emissiveIntensity: 0.75,
      toneMapped: false,
      metalness: 0.1,
      roughness: 0.4,
    }),
  );
  const hot = material(new THREE.MeshBasicMaterial({ color: SIGNAL.hot }));
  const rig = new THREE.Group();
  scene.add(rig);
  const core = new THREE.Group();
  rig.add(core);
  function plate(
    points: number[][],
    depth: number,
    mat: THREE.Material,
    bevel = 0.035,
  ) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) =>
      i ? shape.lineTo(x, y) : shape.moveTo(x, y),
    );
    shape.closePath();
    const g = geometry(
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: bevel,
        bevelThickness: bevel,
        curveSegments: 1,
      }),
    );
    g.translate(0, 0, -depth / 2);
    return new THREE.Mesh(g, mat);
  }
  // Two asymmetric interlocking shells, split into pre-cut fracture facets.
  // A stepped negative space exposes the diagonal conductive ribbon inside.
  const pieces: {
    mesh: THREE.Mesh;
    direction: number;
    origin: THREE.Vector3;
  }[] = [];
  const contours = [
    [
      [-0.09, 0.91],
      [-0.46, 0.61],
      [-0.47, -0.09],
      [-0.29, -0.29],
      [-0.14, 0.07],
    ],
    [
      [-0.47, -0.12],
      [-0.28, -0.32],
      [-0.39, -0.78],
      [-0.21, -0.91],
      [-0.07, -0.23],
      [-0.18, -0.06],
    ],
    [
      [0.23, 0.93],
      [0.07, 0.25],
      [0.2, 0.06],
      [0.48, 0.29],
      [0.43, 0.75],
    ],
    [
      [0.2, 0.03],
      [0.48, 0.26],
      [0.47, -0.62],
      [0.1, -0.91],
      [0.15, -0.3],
    ],
  ];
  contours.forEach((points, i) => {
    const mesh = plate(points, 0.25, shell);
    core.add(mesh);
    pieces.push({
      mesh,
      direction: i < 2 ? -1 : 1,
      origin: mesh.position.clone(),
    });
    const trim = new THREE.LineSegments(
      geometry(new THREE.EdgesGeometry(mesh.geometry, 32)),
      material(
        new THREE.LineBasicMaterial({
          color: 0x767984,
          transparent: true,
          opacity: 0.34,
        }),
      ),
    );
    mesh.add(trim);
  });
  const ribbon = plate(
    [
      [-0.2, -0.88],
      [-0.105, -0.84],
      [0.2, 0.86],
      [0.105, 0.81],
    ],
    0.075,
    energy,
  );
  core.add(ribbon);
  const filament = plate(
    [
      [-0.13, -0.72],
      [-0.112, -0.69],
      [0.13, 0.72],
      [0.112, 0.69],
    ],
    0.085,
    hot,
  );
  core.add(filament);
  const pinG = geometry(new THREE.CylinderGeometry(0.026, 0.026, 0.3, 8));
  for (const [x, y] of [
    [-0.32, 0.45],
    [-0.29, -0.5],
    [0.31, 0.6],
    [0.31, -0.41],
  ]) {
    const pin = new THREE.Mesh(pinG, edges);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(x, y, 0.04);
    core.add(pin);
  }
  const hand = new THREE.Group();
  rig.add(hand);
  // Broad tapering palm, padded thumb mound, covered joints and nail-like caps.
  // Rounded phalanges follow human proportions instead of a skeletal robot claw.
  const palm = plate(
    [
      [-0.48, -0.71],
      [-0.61, -0.3],
      [-0.62, 0.14],
      [-0.48, 0.42],
      [0.43, 0.44],
      [0.56, 0.2],
      [0.52, -0.36],
      [0.38, -0.73],
      [0.25, -0.9],
      [-0.22, -0.9],
    ],
    0.3,
    handMaterial,
    0.09,
  );
  palm.position.set(0, -0.64, -0.35);
  hand.add(palm);
  const capsule = geometry(new THREE.CapsuleGeometry(1, 1, 4, 10));
  const ball = geometry(new THREE.SphereGeometry(1, 12, 8));
  function padded(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    mat: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(ball, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(rx, ry, rz);
    parent.add(mesh);
    return mesh;
  }
  padded(hand, -0.43, -0.67, -0.15, 0.28, 0.48, 0.22, handMaterial);
  const wrist = new THREE.Mesh(capsule, handMaterial);
  wrist.position.set(0, -2.0, -0.46);
  wrist.scale.set(0.43, 0.65, 0.29);
  hand.add(wrist);
  const fingers: {
    base: THREE.Group;
    joints: THREE.Group[];
    spread: number;
  }[] = [];
  const lengths = [
    [0.52, 0.37, 0.29],
    [0.63, 0.43, 0.32],
    [0.59, 0.4, 0.31],
    [0.44, 0.32, 0.26],
  ];
  for (let f = 0; f < 4; f++) {
    const base = new THREE.Group();
    base.position.set(
      -0.46 + f * 0.31,
      -0.2 + (f === 0 ? -0.04 : f === 3 ? -0.13 : 0),
      -0.32,
    );
    hand.add(base);
    const joints: THREE.Group[] = [];
    let parent: THREE.Group = base;
    lengths[f].forEach((length, j) => {
      const pivot = new THREE.Group();
      parent.add(pivot);
      joints.push(pivot);
      const radius = 0.133 - j * 0.012 - (f === 3 ? 0.014 : 0);
      const phalanx = new THREE.Mesh(capsule, handMaterial);
      phalanx.scale.set(radius, length / 3, radius * 0.85);
      phalanx.position.y = length / 2;
      pivot.add(phalanx);
      padded(
        pivot,
        0,
        0.035,
        0,
        radius * 0.95,
        0.09,
        radius * 0.86,
        jointMaterial,
      );
      if (j === 2)
        padded(
          pivot,
          0,
          length * 0.7,
          0.09,
          radius * 0.68,
          length * 0.23,
          0.025,
          edges,
        );
      const next = new THREE.Group();
      next.position.y = length;
      pivot.add(next);
      parent = next;
    });
    fingers.push({ base, joints, spread: (1.5 - f) * 0.12 });
  }
  const thumbBase = new THREE.Group();
  thumbBase.position.set(-0.53, -0.72, -0.17);
  hand.add(thumbBase);
  const thumbJoints: THREE.Group[] = [];
  let thumbParent = thumbBase;
  for (const length of [0.5, 0.42]) {
    const pivot = new THREE.Group();
    thumbParent.add(pivot);
    thumbJoints.push(pivot);
    const bone = new THREE.Mesh(capsule, handMaterial);
    bone.position.y = length * 0.5;
    bone.scale.set(0.18, length / 3, 0.15);
    pivot.add(bone);
    const next = new THREE.Group();
    next.position.y = length;
    pivot.add(next);
    thumbParent = next;
  }
  // Fine inlaid tendons reinforce a synthetic hand without exposed machinery.
  for (let i = 0; i < 4; i++) {
    const tendon = new THREE.Mesh(
      geometry(new THREE.BoxGeometry(0.018, 0.5, 0.012)),
      edges,
    );
    tendon.position.set(-0.43 + i * 0.28, -0.8, -0.16);
    tendon.rotation.z = (i - 1.5) * -0.055;
    hand.add(tendon);
  }
  const ambient = new THREE.HemisphereLight(0xc9d4ec, 0x210711, 2.3);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xeff1ff, 4);
  key.position.set(-400, 500, 700);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff2045, 0.6);
  rim.position.set(400, -100, -150);
  scene.add(rim);
  const soft = new THREE.DirectionalLight(0x929faf, 1.5);
  soft.position.set(200, 200, -500);
  scene.add(soft);
  const leak = new THREE.Group();
  rig.add(leak);
  const strandG = geometry(new THREE.CylinderGeometry(1, 1, 1, 6, 1, true));
  const strands = Array.from({ length: 7 }, () => {
    const m = new THREE.Mesh(strandG, energy);
    leak.add(m);
    return m;
  });
  const drops = new THREE.InstancedMesh(ball, energy, 14);
  leak.add(drops);
  const dummy = new THREE.Object3D();
  const glowMaterial = material(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uStrength: { value: 1 },
        uColor: { value: new THREE.Color(SIGNAL.red) },
      },
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec2 vUv;uniform float uStrength;uniform vec3 uColor;void main(){float d=length((vUv-.5)*vec2(2.,1.));gl_FragColor=vec4(uColor,exp(-d*d*22.)*.045*uStrength);}",
    }),
  );
  const glow = new THREE.Mesh(
    geometry(new THREE.PlaneGeometry(3, 4)),
    glowMaterial,
  );
  glow.position.z = -0.6;
  rig.add(glow);
  return {
    resize(w: number, h: number) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    },
    render(p: SignalPose, time: number) {
      if (disposed) return;
      rig.visible = p.reveal > 0.001;
      rig.position.set(p.x - width / 2, height / 2 - p.y, 0);
      rig.scale.setScalar(p.size / 2);
      core.rotation.set(
        0.14 + Math.sin(time * 0.21) * 0.025,
        p.turn,
        -0.18 + p.grip * 0.12,
      );
      core.scale.set(1 - p.crush * 0.32, 1 - p.crush * 0.48, 1);
      core.visible = p.release < 0.98;
      pieces.forEach(({ mesh, direction }, i) => {
        mesh.position.set(
          direction * p.crush * 0.18,
          -p.crush * (i % 2) * 0.16,
          p.crush * (i % 2 ? -0.09 : 0.06),
        );
        mesh.rotation.z = direction * p.crush * (i % 2 ? 0.18 : -0.12);
      });
      ribbon.scale.x = 1 + p.crush * 0.9;
      ribbon.scale.y = 1 - p.crush * 0.28;
      energy.emissiveIntensity =
        0.65 + p.crush * 0.45 + Math.sin(time * 1.3) * 0.08;
      hand.visible = p.hand > 0.001;
      hand.position.set(0.11, lerp(-3.8, 0, p.hand), -0.05);
      hand.rotation.set(0.08, -0.22, -0.12);
      fingers.forEach(({ base, joints, spread }, i) => {
        base.rotation.z = spread * (1 - p.grip * 0.7);
        joints[0].rotation.x = lerp(-0.12, 0.08, p.grip);
        joints[1].rotation.x = lerp(0.06, 1.3, p.grip);
        joints[2].rotation.x = lerp(0.04, 1.4, p.grip);
        base.position.z = -0.32 + p.grip * 0.06 + (i === 3 ? 0.015 : 0);
      });
      thumbBase.rotation.set(0.2, 0, lerp(0.8, -0.86, p.grip));
      thumbJoints[0].rotation.x = lerp(0.1, 0.62, p.grip);
      thumbJoints[1].rotation.x = lerp(0, -0.8, p.grip);
      leak.visible = p.release > 0.001;
      strands.forEach((strand, i) => {
        const l = (0.25 + p.release * 2.7) * (1 - Math.abs(i - 3) * 0.09);
        strand.position.set(
          (i - 3) * 0.045 + Math.sin(time * 0.7 + i) * 0.023,
          -0.45 - l * 0.5,
          0.42,
        );
        strand.scale.set(0.008 + (i === 3 ? 0.01 : 0), l, 0.009);
        strand.rotation.z = Math.sin(i * 2 + time * 0.5) * 0.022;
      });
      for (let i = 0; i < 14; i++) {
        const phase = (time * 0.17 + i * 0.137) % 1;
        dummy.position.set(
          Math.sin(i * 2.4) * 0.18 * (1 - phase),
          -0.52 - phase * phase * 3.5,
          0.45,
        );
        dummy.scale.set(0.012, 0.025 + phase * 0.035, 0.012);
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
      }
      drops.instanceMatrix.needsUpdate = true;
      glow.scale.setScalar(1 + p.crush * 0.6);
      glowMaterial.uniforms.uStrength.value = p.reveal * (0.7 + p.crush * 0.8);
      // Whole group opacity is handled by the canvas, never scale-as-opacity.
      renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
      drops.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}

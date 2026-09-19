import * as THREE from "three";
import { smooth } from "./opening-math";
import { SIGNAL } from "./signal-material";

export type SignalPose = {
  x: number;
  y: number;
  size: number;
  turn: number;
  unlock: number;
  lift: number;
  hand: number;
  grip: number;
  crush: number;
  release: number;
  mobile: boolean;
};

/** A machined architectural fragment, not a deforming primitive. The shadow
 * hand uses a registered photographic pose atlas; there is no procedural hand
 * geometry. All articulation and fracture are deterministic/reversible. */
export function createSignalWorld(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
  camera.position.z = 1200;
  const geometries: THREE.BufferGeometry[] = [],
    materials: THREE.Material[] = [];
  const geometry = <T extends THREE.BufferGeometry>(g: T) => (
    geometries.push(g),
    g
  );
  const material = <T extends THREE.Material>(m: T) => (materials.push(m), m);
  const shell = material(
    new THREE.MeshStandardMaterial({
      color: 0x45474e,
      metalness: 0.38,
      roughness: 0.38,
    }),
  );
  const side = material(
    new THREE.MeshStandardMaterial({
      color: 0x0b0d10,
      metalness: 0.55,
      roughness: 0.48,
    }),
  );
  const housingMat = material(
    new THREE.MeshStandardMaterial({
      color: 0x17171b,
      metalness: 0.3,
      roughness: 0.68,
    }),
  );
  const energy = material(
    new THREE.MeshStandardMaterial({
      color: SIGNAL.dark,
      emissive: SIGNAL.red,
      emissiveIntensity: 1,
      toneMapped: false,
    }),
  );
  const rig = new THREE.Group(),
    core = new THREE.Group(),
    housing = new THREE.Group();
  scene.add(rig);
  rig.add(core, housing);
  function plate(points: number[][], depth: number, mat: THREE.Material) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) =>
      i ? shape.lineTo(x, y) : shape.moveTo(x, y),
    );
    shape.closePath();
    const g = geometry(
      new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0.013,
        bevelThickness: 0.015,
        curveSegments: 1,
      }),
    );
    g.translate(0, 0, -depth / 2);
    return new THREE.Mesh(g, mat);
  }
  // Offset crowns, recessed spine and interlocking diagonal cuts. 3.5:1 silhouette.
  const contours = [
    [
      [-0.43, 1.47],
      [-0.16, 1.61],
      [-0.08, 0.29],
      [-0.19, 0.09],
      [-0.43, 0.23],
    ],
    [
      [-0.43, 0.19],
      [-0.18, 0.05],
      [-0.09, -1.4],
      [-0.34, -1.55],
      [-0.43, -1.36],
    ],
    [
      [0.02, 1.38],
      [0.34, 1.49],
      [0.41, 0.36],
      [0.11, 0.15],
    ],
    [
      [0.11, 0.1],
      [0.43, 0.3],
      [0.43, -1.31],
      [0.18, -1.52],
      [0.1, -0.28],
    ],
    [
      [-0.29, 1.58],
      [-0.16, 1.65],
      [-0.14, -1.29],
      [-0.29, -1.46],
    ],
    [
      [0.26, 1.27],
      [0.48, 1.35],
      [0.48, -1.13],
      [0.34, -1.28],
    ],
  ];
  const plates = contours.map((points, i) => {
    const mesh = plate(points, i > 3 ? 0.38 : 0.25, i > 3 ? side : shell);
    mesh.position.z = i > 3 ? -0.18 : 0.18 + (i % 2) * 0.035;
    core.add(mesh);
    return { mesh, z: mesh.position.z, sign: i < 2 || i === 4 ? -1 : 1 };
  });
  const seam = plate(
    [
      [-0.015, 1.35],
      [0.015, 1.34],
      [0.07, -1.4],
      [0.035, -1.44],
    ],
    0.05,
    energy,
  );
  seam.position.z = 0.18;
  core.add(seam);
  const socket = new THREE.Mesh(
    geometry(new THREE.BoxGeometry(0.12, 0.08, 0.24)),
    energy,
  );
  socket.position.set(0, -1.4, 0.21);
  core.add(socket);
  // The tiny visible seam belongs to this housing from the first foundation frame.
  // Doors move apart; then fall below the lifting core. No opacity-based spawn.
  const doors = [-1, 1].map((sign) => {
    const door = plate(
      [
        [0.035, 1.8],
        [1.0, 2.03],
        [1.36, 1.51],
        [1.36, -5],
        [0.035, -5],
      ],
      0.5,
      housingMat,
    );
    door.scale.x = sign;
    door.position.z = 0.55;
    const recess = new THREE.Mesh(
      geometry(new THREE.BoxGeometry(0.035, 4.1, 0.02)),
      side,
    );
    recess.position.set(0.98, -0.74, 0.3);
    door.add(recess);
    housing.add(door);
    return { door, sign };
  });
  // Short fracture filaments, not droplets/strands. Their ends return to the seam.
  const arcs = new THREE.Group();
  core.add(arcs);
  for (let i = 0; i < 3; i++) {
    const sign = i % 2 ? -1 : 1,
      y = 0.3 - i * 0.45;
    const g = geometry(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, y, 0.42),
        new THREE.Vector3(sign * 0.25, y + 0.08, 0.42),
        new THREE.Vector3(sign * 0.16, y - 0.07, 0.42),
        new THREE.Vector3(0, y - 0.23, 0.42),
      ]),
    );
    arcs.add(
      new THREE.Line(
        g,
        material(
          new THREE.LineBasicMaterial({
            color: SIGNAL.hot,
            transparent: true,
            opacity: 0.7,
          }),
        ),
      ),
    );
  }
  let disposed = false,
    width = 1,
    height = 1;
  const atlas = new THREE.TextureLoader().load(
    "/textures/cipher-shadow-hand.webp",
    (t) => {
      if (disposed) t.dispose();
    },
  );
  atlas.colorSpace = THREE.SRGBColorSpace;
  const uniforms = {
    uAtlas: { value: atlas },
    uGrip: { value: 0 },
    uDepth: { value: 0 },
    uFront: { value: 0 },
    uCrush: { value: 0 },
  };
  const handFragment = `
    varying vec2 vUv; uniform sampler2D uAtlas; uniform float uGrip,uDepth,uFront,uCrush;
    // Anatomical landmarks in the registered atlas (UV, not screen coordinates).
    // Inverse-warp both source poses toward the same intermediate finger tips.
    // A plain dissolve leaves two silhouettes; this moves the silhouette first.
    vec2 tip(float n,int i){
      if(i==0)return n<.5?vec2(.16,.57):(n<1.5?vec2(.42,.59):vec2(.457,.59));
      if(i==1)return n<.5?vec2(.39,.88):(n<1.5?vec2(.397,.76):vec2(.407,.72));
      if(i==2)return n<.5?vec2(.55,.965):(n<1.5?vec2(.547,.94):vec2(.532,.69));
      if(i==3)return n<.5?vec2(.655,.90):(n<1.5?vec2(.65,.86):vec2(.657,.63));
      return n<.5?vec2(.765,.76):(n<1.5?vec2(.743,.75):vec2(.737,.56));
    }
    vec2 phases(float delay){
      return vec2(smoothstep(delay,delay+.40,uGrip),smoothstep(.43+delay,.82+delay,uGrip));
    }
    vec4 pose(float n){
      float displacement=0.,weightSum=0.;
      // Four soft longitudinal lanes preserve rounded fingertip silhouettes.
      // The thumb's large lateral move uses the authored first contact pose;
      // warping it through adjacent fingers would shear their silhouettes.
      for(int i=1;i<5;i++){
        vec2 phasesI=phases(float(i)*.045);
        vec2 target=mix(mix(tip(0.,i),tip(1.,i),phasesI.x),tip(2.,i),phasesI.y);
        float root=.46;
        float along=max(0.,(vUv.y-root)/max(target.y-root,.07));
        float lane=1.-smoothstep(.040,.064,abs(vUv.x-target.x));
        float weight=lane*smoothstep(root,root+.12,vUv.y);
        displacement+=(tip(n,i).y-target.y)*along*weight;
        weightSum+=weight;
      }
      vec2 uv=vUv+vec2(0.,displacement/max(1.,weightSum));
      // Register the actual wrist centres in the generated atlas, preventing
      // the entire palm from drifting left while the fingers close.
      uv.x-=n<.5?0.:(n<1.5?.025:.047);
      float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
      vec4 c=texture2D(uAtlas,vec2((clamp(uv.x,.001,.999)+n)/3.,clamp(uv.y,.001,.999)));
      c.a*=inside; return c;
    }
    vec4 blend(vec4 a,vec4 b,float t){
      // Premultiplied interpolation avoids dark/transparent edge ghosts.
      float alpha=mix(a.a,b.a,t);
      return vec4(mix(a.rgb*a.a,b.rgb*b.a,t)/max(alpha,.0001),alpha);
    }
    void main(){
      // Thumb (left) positions first, index/middle next, ulnar fingers last.
      float delay=mix(0.,.18,smoothstep(.35,.8,vUv.x));
      float a=smoothstep(delay,delay+.40,uGrip);
      float b=smoothstep(.43+delay,.82+delay,uGrip);
      vec4 c=blend(blend(pose(0.),pose(1.),smoothstep(.25,.75,a)),pose(2.),smoothstep(.25,.75,b));
      float light=mix(.28,.68,uDepth)+uCrush*.12;
      float reveal=smoothstep(1.-uDepth*1.25,1.15-uDepth*1.05,vUv.y);
      float fingerMask=smoothstep(.28,.40,vUv.y)*smoothstep(.2,.58,uGrip);
      c.rgb*=light;
      c.a*=reveal*smoothstep(.025,.22,vUv.y)*mix(1.,fingerMask,uFront);
      gl_FragColor=c;
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  const handRig = new THREE.Group();
  rig.add(handRig);
  const handGeo = geometry(new THREE.PlaneGeometry(6.2, 6.2));
  const backMat = material(
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: handFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  const frontUniforms = { ...uniforms, uFront: { value: 1 } };
  const frontMat = material(
    new THREE.ShaderMaterial({
      uniforms: frontUniforms,
      vertexShader: backMat.vertexShader,
      fragmentShader: handFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  const backHand = new THREE.Mesh(handGeo, backMat),
    frontHand = new THREE.Mesh(handGeo, frontMat);
  backHand.position.set(-0.12, -0.34, -0.7);
  backHand.renderOrder = 0;
  frontHand.position.set(-0.12, -0.34, 0.8);
  frontHand.renderOrder = 3;
  handRig.add(backHand, frontHand);
  scene.add(new THREE.HemisphereLight(0xa0a5b6, 0x140910, 2.2));
  const key = new THREE.DirectionalLight(0xc1c5d1, 3);
  key.position.set(-600, 800, 1000);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9a142b, 0.55);
  rim.position.set(500, -100, 600);
  scene.add(rim);
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
      rig.position.set(p.x - width / 2, height / 2 - p.y, 0);
      rig.scale.setScalar(p.size / 3.2);
      core.rotation.set(0.035, p.turn, 0);
      // No core scale animation: fixed-size plates compress, then two facets snap.
      plates.forEach(({ mesh, z, sign }, i) => {
        const fracture =
          smooth(0.48, 0.78, p.crush) * (i === 1 || i === 2 ? 1 : 0);
        mesh.position.set(
          -sign * p.crush * 0.09 + sign * fracture * 0.13,
          -fracture * 0.19,
          z + fracture * 0.15,
        );
        mesh.rotation.z = sign * fracture * 0.13;
        mesh.rotation.y = sign * fracture * 0.21;
      });
      energy.emissiveIntensity =
        (0.65 + p.crush * 2.4) * (1 - p.release * 0.68) +
        Math.sin(time * 1.2) * 0.055;
      doors.forEach(({ door, sign }) => {
        door.position.x = sign * p.unlock * 0.75;
        door.position.y = -p.lift * 8;
      });
      housing.visible = p.lift < 1;
      arcs.visible = p.crush > 0.35 && p.release < 0.5;
      handRig.visible = p.hand > 0;
      handRig.scale.setScalar(0.68 + p.hand * 0.32);
      handRig.position.set(
        p.mobile ? 0.58 : 0,
        -(1 - p.hand) * 1.5,
        -(1 - p.hand) * 0.8,
      );
      handRig.rotation.z = p.mobile ? 0.7 : 0;
      uniforms.uGrip.value = p.grip;
      uniforms.uDepth.value = p.hand;
      uniforms.uCrush.value = p.crush * (1 - p.release);
      renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
      atlas.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}

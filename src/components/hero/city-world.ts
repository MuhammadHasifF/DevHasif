import * as THREE from "three";
import { cityCamera, smooth, lerp } from "./opening-math";

export interface CityWorld {
  readonly ready: boolean;
  resize(width: number, height: number): void;
  render(descent: number, seconds: number): void;
  dispose(): void;
}
const noise = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02+vec2(17.2,9.1);a*=.5;}return v;}
`;

/** Chamfered, tapered monolith with a diagonal crown, shared by every instance. */
function monolithGeometry() {
  const footprint = [
    [-0.36, -0.5],
    [0.32, -0.5],
    [0.5, -0.31],
    [0.5, 0.32],
    [0.31, 0.5],
    [-0.34, 0.5],
    [-0.5, 0.32],
    [-0.5, -0.32],
  ];
  const low = footprint.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const high = footprint.map(
    ([x, z]) => new THREE.Vector3(x * 0.79, 0.94 + x * 0.12, z * 0.81),
  );
  const vertices: number[] = [];
  const triangle = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) =>
    vertices.push(...a.toArray(), ...b.toArray(), ...c.toArray());
  for (let i = 0; i < 8; i++) {
    const j = (i + 1) % 8;
    triangle(low[i], high[i], low[j]);
    triangle(low[j], high[i], high[j]);
  }
  for (let i = 1; i < 7; i++) triangle(high[0], high[i + 1], high[i]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.computeVertexNormals();
  return g;
}

/** Hybrid depth: original distant city artwork, real foreground megastructures,
 * GPU cloud fields, and one continuous vertical camera path. No scene swaps. */
export function createCityWorld(
  canvas: HTMLCanvasElement,
  mobile: boolean,
): CityWorld {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  let shaderFailed = false,
    disposed = false,
    textureReady = false;
  renderer.debug.onShaderError = () => {
    shaderFailed = true;
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mobile ? 57 : 48, 1, 1, 9000);
  const fog = new THREE.FogExp2(0x252328, 0.00058);
  scene.fog = fog;
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>();
  const geometry = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g);
    return g;
  };
  const material = <T extends THREE.Material>(m: T) => {
    materials.add(m);
    return m;
  };
  const clock = { value: 0 },
    travel = { value: 0 },
    aspect = { value: 1 };
  const loader = new THREE.TextureLoader();
  const worldTexture = loader.load("/textures/monolith-world.webp", () => {
    textureReady = true;
    if (disposed) worldTexture.dispose();
  });
  worldTexture.colorSpace = THREE.SRGBColorSpace;
  worldTexture.minFilter = THREE.LinearFilter;
  worldTexture.generateMipmaps = false;
  // A camera-space matte supplies distant architectural complexity. Real nearby
  // planes and towers provide perspective and occlusion as the camera descends.
  const backdrop = new THREE.Mesh(
    geometry(new THREE.PlaneGeometry(2, 2)),
    material(
      new THREE.ShaderMaterial({
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uWorld: { value: worldTexture },
          uTravel: travel,
          uAspect: aspect,
          uTime: clock,
        },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.0,1.0);}`,
        fragmentShader: `varying vec2 vUv;uniform sampler2D uWorld;uniform float uTravel,uAspect,uTime;
    ${noise}
    void main(){
      float visibleHeight=min(.74,.666667/uAspect);
      float visibleWidth=min(1.0,uAspect*1.5*visibleHeight);
      vec2 imageUv=vec2(.5+(vUv.x-.5)*visibleWidth,(1.0-uTravel)*(1.0-visibleHeight)+vUv.y*visibleHeight);
      vec3 city=texture2D(uWorld,imageUv).rgb;
      float cloud=fbm(vUv*vec2(4.8,3.1)+vec2(uTime*.004,0.0));
      float veil=(1.0-smoothstep(.04,.27,uTravel))*.9;
      vec3 sky=mix(vec3(.024,.026,.03),vec3(.16,.165,.175),smoothstep(.25,.78,cloud));
      sky+=vec3(.07,.003,.012)*pow(max(0.0,1.0-length(vUv-vec2(.58,.2))),5.0);
      city=mix(city,sky,veil);
      float lower=smoothstep(.73,1.0,uTravel);
      city*=1.0-lower*.42;
      gl_FragColor=vec4(city,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
      }),
    ),
  );
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -100;
  scene.add(backdrop);
  const graphite = material(
    new THREE.MeshStandardMaterial({
      color: 0x202126,
      roughness: 0.66,
      metalness: 0.35,
    }),
  );
  graphite.onBeforeCompile = (shader) => {
    shader.vertexShader = "varying vec3 vStone;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `
      #include <worldpos_vertex>
      vec4 stone=vec4(transformed,1.0);
      #ifdef USE_INSTANCING
      stone=instanceMatrix*stone;
      #endif
      vStone=(modelMatrix*stone).xyz;`,
    );
    shader.fragmentShader =
      "varying vec3 vStone;\n" + noise + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      #include <color_fragment>
      float erosion=noise(vStone.xy*vec2(.13,.004));
      float joint=step(.992,fract(vStone.x*.032));
      diffuseColor.rgb*=.74+erosion*.3-joint*.08;`,
    );
  };
  const dark = material(
    new THREE.MeshStandardMaterial({
      color: 0x111217,
      roughness: 0.79,
      metalness: 0.24,
    }),
  );
  const crimson = material(
    new THREE.MeshBasicMaterial({ color: 0x981225, toneMapped: false }),
  );
  const signal = material(
    new THREE.MeshBasicMaterial({ color: 0xef2844, toneMapped: false }),
  );
  const prism = geometry(monolithGeometry()),
    box = geometry(new THREE.BoxGeometry(1, 1, 1));
  scene.add(new THREE.HemisphereLight(0xc1c3ce, 0x13060b, 1.6));
  const light = new THREE.DirectionalLight(0xcbd0d7, 2.5);
  light.position.set(-800, 2300, 1300);
  scene.add(light);
  const redLight = new THREE.PointLight(0xc51730, 16000, 1000, 1.8);
  redLight.position.set(-270, 460, -700);
  scene.add(redLight);
  const dummy = new THREE.Object3D();
  type Tower = {
    x: number;
    z: number;
    h: number;
    w: number;
    d: number;
    turn: number;
  };
  const towers: Tower[] = [
    { x: -445, z: -840, h: 2150, w: 145, d: 190, turn: -0.13 },
    { x: -590, z: -1030, h: 2330, w: 72, d: 125, turn: -0.13 },
    { x: 470, z: -1130, h: 1920, w: 185, d: 180, turn: 0.14 },
    { x: 630, z: -1330, h: 2060, w: 75, d: 140, turn: 0.14 },
    { x: -1020, z: -2170, h: 1780, w: 140, d: 170, turn: 0.05 },
    { x: 1080, z: -2530, h: 2260, w: 115, d: 150, turn: -0.1 },
  ];
  const mesh = new THREE.InstancedMesh(prism, graphite, towers.length);
  if (mobile) towers.forEach((tower) => { tower.x *= 0.55; });
  towers.forEach((t, i) => {
    dummy.position.set(t.x, 0, t.z);
    dummy.scale.set(t.w, t.h, t.d);
    dummy.rotation.set(0, t.turn, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.computeBoundingSphere();
  scene.add(mesh);
  const seams = new THREE.InstancedMesh(box, signal, towers.length * 2);
  towers.forEach((t, i) => {
    for (let part = 0; part < 2; part++) {
      dummy.position.set(
        t.x + (part ? -0.15 : 0.09) * t.w,
        part ? t.h * 0.27 : t.h * 0.65,
        t.z + t.d * 0.46,
      );
      dummy.rotation.set(0, t.turn, 0);
      dummy.scale.set(part ? 0.65 : 1.05, part ? t.h * 0.24 : t.h * 0.11, 0.7);
      dummy.updateMatrix();
      seams.setMatrixAt(i * 2 + part, dummy.matrix);
    }
  });
  seams.computeBoundingSphere();
  scene.add(seams);
  function block(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
  ) {
    const m = new THREE.Mesh(box, mat);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    scene.add(m);
    return m;
  }
  // A few massive buttresses and voids; no floor bands or office window grids.
  for (const t of towers.slice(0, 4)) {
    // Foundations extend below the camera path, rather than ending as floating
    // blocks against the distant matte at the final low viewpoint.
    block(t.x, -500, t.z, t.w * 1.7, 1440, t.d * 1.35, dark);
    block(
      t.x + t.w * 0.17,
      t.h * 0.43,
      t.z + t.d * 0.44,
      t.w * 0.21,
      t.h * 0.085,
      4,
      crimson,
    );
    block(
      t.x + t.w * 0.21,
      t.h * 0.43,
      t.z + t.d * 0.46,
      t.w * 0.18,
      t.h * 0.079,
      4,
      dark,
    );
  }
  block(0, 255, -2050, 1220, 11, 30, dark);
  block(0, 259, -2033, 1120, 0.6, 0.6, crimson);
  // Tiny remote signals establish scale without turning the scene into a grid.
  const traces = new THREE.InstancedMesh(box, crimson, mobile ? 16 : 30);
  let seed = 9031;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const tracePositions = Array.from({ length: traces.count }, () => ({
    x: (random() - 0.5) * 2500,
    z: -900 - random() * 4200,
    length: 8 + random() * 25,
  }));
  const fogPlane = geometry(new THREE.PlaneGeometry(4600, 2100));
  const fogMaterial = material(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: clock, uTravel: travel },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec2 vUv;uniform float uTime,uTravel;${noise}
    void main(){float n=fbm(vUv*vec2(5.,3.)+vec2(uTime*.004,0.0));
    float edge=(1.-smoothstep(.3,.5,abs(vUv.x-.5)))*(1.-smoothstep(.2,.5,abs(vUv.y-.5)));
    float alpha=smoothstep(.28,.8,n)*edge*.36;
    vec3 col=mix(vec3(.075,.073,.083),vec3(.19,.19,.2),n);
    gl_FragColor=vec4(col,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`,
    }),
  );
  for (const [y, z] of [
    [2240, -400],
    [1700, -720],
    [900, -1650],
    [200, -640],
  ]) {
    const plane = new THREE.Mesh(fogPlane, fogMaterial);
    plane.position.set(0, y, z);
    scene.add(plane);
  }
  const look = new THREE.Vector3();
  scene.add(traces);
  return {
    get ready() { return textureReady; },
    resize(width, height) {
      if (disposed) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      aspect.value = camera.aspect;
      camera.updateProjectionMatrix();
    },
    render(t, seconds) {
      if (disposed) return;
      travel.value = t;
      clock.value = seconds;
      const pose = cityCamera(t);
      camera.position.set(pose.x, pose.y, pose.z);
      look.set(0, pose.targetY, pose.targetZ);
      camera.lookAt(look);
      camera.rotateZ(pose.roll);
      fog.density = lerp(0.0006, 0.00125, smooth(0.75, 1, t));
      redLight.intensity = 15000 + Math.sin(seconds * 0.3) * 1000;
      tracePositions.forEach((p, i) => {
        dummy.position.set(p.x, 1, p.z + ((seconds * 3) % 120));
        dummy.scale.set(0.8, 0.3, p.length);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        traces.setMatrixAt(i, dummy.matrix);
      });
      traces.instanceMatrix.needsUpdate = true;
      // Keep DOM fallback visible until the texture is decoded, avoiding a black first frame.
      if (!textureReady) return;
      renderer.render(scene, camera);
      if (shaderFailed) throw new Error("Monolith shader failed");
    },
    dispose() {
      disposed = true;
      scene.traverse((o) => {
        if (o instanceof THREE.InstancedMesh) o.dispose();
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      worldTexture.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

import * as THREE from "three";
import { cityCamera, lerp, smooth } from "./opening-math";

/** One renderer, shared by the aperture and the full-screen descent. */
export interface CityWorld {
  resize(width: number, height: number): void;
  render(descent: number, seconds: number): void;
  dispose(): void;
}

type Block = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  turn?: number;
};
const noise = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.2,9.1);a*=0.5;}
  return v;
}`;

export function createCityWorld(
  canvas: HTMLCanvasElement,
  mobile: boolean,
): CityWorld {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.35));
  renderer.setClearColor(0x101116);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  let shaderFailed = false;
  renderer.debug.onShaderError = () => {
    shaderFailed = true;
  };
  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(0x17151b, 0.0038);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(mobile ? 59 : 49, 1, 0.5, 2300);
  const time = { value: 0 };
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const ownGeometry = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g);
    return g;
  };
  const ownMaterial = <T extends THREE.Material>(m: T) => {
    materials.add(m);
    return m;
  };
  const box = ownGeometry(new THREE.BoxGeometry(1, 1, 1));
  const steel = ownMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x171b23,
      roughness: 0.63,
      metalness: 0.55,
    }),
  );
  const concrete = ownMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x2b2d32,
      roughness: 0.88,
      metalness: 0.15,
    }),
  );
  const red = ownMaterial(
    new THREE.MeshBasicMaterial({ color: 0xdd1231, toneMapped: false }),
  );
  const hot = ownMaterial(
    new THREE.MeshBasicMaterial({ color: 0xff5260, toneMapped: false }),
  );
  const facade = ownMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x292d35,
      roughness: 0.77,
      metalness: 0.35,
    }),
  );
  // Windows are evaluated on the GPU, not individual meshes or DOM nodes.
  facade.onBeforeCompile = (shader) => {
    shader.uniforms.uCityTime = time;
    shader.vertexShader = "varying vec3 vCityWorld;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `
      #include <worldpos_vertex>
      vec4 cityPosition = vec4(transformed,1.0);
      #ifdef USE_INSTANCING
        cityPosition = instanceMatrix * cityPosition;
      #endif
      vCityWorld = (modelMatrix * cityPosition).xyz;
    `,
    );
    shader.fragmentShader =
      "varying vec3 vCityWorld; uniform float uCityTime;\n" +
      noise +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `
      #include <emissivemap_fragment>
      vec2 panel = vec2(vCityWorld.x + vCityWorld.z, vCityWorld.y) * vec2(0.32,0.43);
      vec2 cell = floor(panel), f = fract(panel);
      float lit = step(0.88, hash(cell));
      float windowShape = step(0.18,f.x)*step(f.x,0.72)*step(0.42,f.y)*step(f.y,0.53);
      float activity = 0.75+0.25*sin(uCityTime*0.35+hash(cell)*30.0);
      totalEmissiveRadiance += vec3(1.6,0.013,0.035)*lit*windowShape*activity;
      diffuseColor.rgb *= 0.82+0.18*step(0.05,fract(vCityWorld.y*0.18));
    `,
    );
  };
  scene.add(new THREE.HemisphereLight(0xaab5cc, 0x21050a, 1.6));
  const moon = new THREE.DirectionalLight(0xaab7c9, 2.3);
  moon.position.set(-220, 380, 100);
  scene.add(moon);
  const crimson = new THREE.PointLight(0xff102c, 1600, 210, 1.5);
  crimson.position.set(5, 45, -160);
  scene.add(crimson);
  const service = new THREE.PointLight(0xff233c, 900, 125, 1.4);
  service.position.set(-10, -40, -200);
  scene.add(service);

  let seed = 8107;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const buildings: Block[] = [],
    ribs: Block[] = [],
    lamps: Block[] = [],
    piers: Block[] = [];
  const rows = mobile ? 15 : 23,
    columns = mobile ? 3 : 5;
  for (const sign of [-1, 1])
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < columns; col++) {
        const w = 19 + random() * 22,
          d = 24 + random() * 25;
        const x = sign * (54 + col * 52 + random() * 10);
        const z = 190 - row * 46 + random() * 16;
        const h = 50 + random() * 220 + col * 9;
        buildings.push({ x, y: h / 2, z, w, h, d });
        buildings.push({
          x: x + sign * w * 0.08,
          y: h + 8,
          z: z - d * 0.06,
          w: w * 0.73,
          h: 16,
          d: d * 0.76,
        });
        buildings.push({ x, y: h + 19, z, w: w * 0.36, h: 6, d: d * 0.45 });
        for (let floor = 16; floor < h; floor += 18)
          ribs.push({ x, y: floor, z, w: w + 0.6, h: 0.55, d: d + 0.6 });
        if (random() > 0.42)
          lamps.push({
            x: x - sign * (w / 2 + 0.08),
            y: h * 0.6,
            z,
            w: 0.22,
            h: 6 + random() * 20,
            d: 0.4,
          });
        if (col === 0) {
          piers.push({ x, y: -35, z, w: w * 0.7, h: 70, d: d * 0.75 });
          ribs.push({ x, y: -2, z, w: w + 9, h: 4, d: d + 4 });
        }
      }
  const dummy = new THREE.Object3D();
  function instances(
    items: Block[],
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
  ) {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(p.w, p.h, p.d);
      dummy.rotation.set(0, 0, p.turn ?? 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    scene.add(mesh);
    return mesh;
  }
  instances(buildings, box, facade);
  instances(ribs, box, steel);
  instances(piers, box, concrete);
  instances(lamps, box, red);
  const bridges: Block[] = [],
    serviceLights: Block[] = [];
  for (let i = 0; i < 12; i++) {
    const z = 140 - i * 70;
    // Crossings stay below the camera's flight path through this location.
    bridges.push({ x: 0, y: i % 3 === 0 ? 32 : -11, z, w: 90, h: 2.4, d: 8 });
    for (const sign of [-1, 1]) {
      bridges.push({ x: sign * 29, y: -36, z, w: 3, h: 76, d: 6 });
      bridges.push({ x: sign * 30, y: -20, z, w: 10, h: 2, d: 62 });
      serviceLights.push({ x: sign * 27, y: -30, z, w: 0.6, h: 0.6, d: 3.5 });
    }
  }
  instances(bridges, box, steel);
  instances(serviceLights, box, hot);
  // Beyond the descent shaft, the underside of the city occludes the sky.
  // It starts ahead of the camera path, so we never fly through a solid slab.
  instances([{ x: 0, y: -1, z: -420, w: 90, h: 5, d: 430 }], box, concrete);
  const pipeGeometry = ownGeometry(
    new THREE.CylinderGeometry(1, 1, 1, mobile ? 8 : 12),
  );
  const pipes = new THREE.InstancedMesh(pipeGeometry, steel, 10);
  let index = 0;
  for (const sign of [-1, 1])
    for (let i = 0; i < 5; i++) {
      dummy.position.set(sign * (24 + i * 2.5), -25 - i * 8, -270);
      dummy.rotation.set(Math.PI / 2, 0, 0);
      dummy.scale.set(1.1 + i * 0.35, 1050, 1.1 + i * 0.35);
      dummy.updateMatrix();
      pipes.setMatrixAt(index++, dummy.matrix);
    }
  pipes.computeBoundingSphere();
  scene.add(pipes);
  const joints: Block[] = [];
  for (let i = 0; i < 22; i++)
    for (const sign of [-1, 1])
      joints.push({
        x: sign * 26,
        y: -42,
        z: 180 - i * 46,
        w: 9,
        h: 23,
        d: 0.8,
      });
  instances(joints, box, steel);
  const waterMaterial = ownMaterial(
    new THREE.MeshStandardMaterial({
      color: 0x070b10,
      metalness: 0.8,
      roughness: 0.23,
    }),
  );
  const water = new THREE.Mesh(
    ownGeometry(new THREE.PlaneGeometry(72, 1400)),
    waterMaterial,
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -76, -350);
  scene.add(water);
  // Long, sparse light reflections in the lower drainage channel.
  const reflections: Block[] = [];
  for (let i = 0; i < 30; i++)
    reflections.push({
      x: (random() - 0.5) * 36,
      y: -75.9,
      z: 120 - i * 30,
      w: 0.12 + random() * 0.2,
      h: 0.015,
      d: 3 + random() * 8,
    });
  instances(
    reflections,
    box,
    ownMaterial(
      new THREE.MeshBasicMaterial({
        color: 0x650e20,
        transparent: true,
        opacity: 0.42,
      }),
    ),
  );

  const sky = new THREE.Mesh(
    ownGeometry(new THREE.SphereGeometry(1700, 24, 12)),
    ownMaterial(
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uTime: time },
        vertexShader: `varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vDirection; uniform float uTime; ${noise}
      void main(){vec3 d=normalize(vDirection);float n=fbm(d.xz*3.7+vec2(uTime*.003,0.0));
      float cloud=smoothstep(.28,.78,n);vec3 col=mix(vec3(.023,.027,.035),vec3(.15,.16,.185),cloud);
      float crimson=pow(max(0.0,1.0-length(d.xz-vec2(.2,-.6))),4.0);
      col+=vec3(.15,.005,.016)*crimson;col*=.7+.3*max(d.y,0.0);gl_FragColor=vec4(col,1.0);}`,
      }),
    ),
  );
  sky.renderOrder = -10;
  scene.add(sky);
  const hazeGeometry = ownGeometry(new THREE.PlaneGeometry(1200, 1200));
  const hazeMaterials: THREE.ShaderMaterial[] = [];
  for (const [y, opacity] of [
    [295, 0.52],
    [218, 0.35],
    [75, 0.2],
    [-37, 0.2],
  ] as const) {
    const material = ownMaterial(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: time,
          uOpacity: { value: opacity },
          uOffset: { value: y },
        },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec2 vUv;uniform float uTime,uOpacity,uOffset;${noise}
      void main(){float n=fbm(vUv*9.0+vec2(uTime*.005,uOffset));float edge=1.0-smoothstep(.1,.5,length(vUv-.5));
      vec3 col=mix(vec3(.09,.085,.11),vec3(.24,.24,.27),n);gl_FragColor=vec4(col,smoothstep(.3,.8,n)*uOpacity*edge);}`,
      }),
    );
    hazeMaterials.push(material);
    const plane = new THREE.Mesh(hazeGeometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, y, -160);
    scene.add(plane);
  }
  const trafficItems: Block[] = [];
  for (let i = 0; i < (mobile ? 10 : 22); i++)
    trafficItems.push({
      x: (random() - 0.5) * 32,
      y: 2 + random() * 2,
      z: random() * 900 - 700,
      w: 0.18,
      h: 0.15,
      d: 2 + random() * 2,
    });
  const traffic = instances(trafficItems, box, hot);
  const look = new THREE.Vector3();
  let disposed = false;
  return {
    resize(width, height) {
      if (disposed) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
    render(descent, seconds) {
      if (disposed) return;
      time.value = seconds;
      const pose = cityCamera(descent);
      camera.position.set(pose.x, pose.y, pose.z);
      look.set(0, pose.targetY, pose.targetZ);
      camera.lookAt(look);
      camera.rotateZ(pose.roll);
      fog.density = lerp(0.0038, 0.0105, smooth(0.62, 1, descent));
      fog.color.setRGB(
        lerp(0.09, 0.017, descent),
        lerp(0.08, 0.012, descent),
        lerp(0.105, 0.021, descent),
      );
      crimson.intensity = 1500 + Math.sin(seconds * 0.4) * 100;
      service.intensity = 900 + Math.sin(seconds * 0.7) * 45;
      hazeMaterials[0].uniforms.uOpacity.value =
        0.52 * (1 - smooth(0.25, 0.5, descent));
      hazeMaterials[1].uniforms.uOpacity.value =
        0.35 * (1 - smooth(0.4, 0.6, descent));
      for (let i = 0; i < trafficItems.length; i++) {
        const p = trafficItems[i];
        dummy.position.set(p.x, p.y, ((p.z + seconds * 3 + 900) % 1000) - 800);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(p.w, p.h, p.d);
        dummy.updateMatrix();
        traffic.setMatrixAt(i, dummy.matrix);
      }
      traffic.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      if (shaderFailed)
        throw new Error("City shader unavailable; use the static fallback.");
    },
    dispose() {
      disposed = true;
      scene.traverse((o) => {
        if (o instanceof THREE.InstancedMesh) o.dispose();
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

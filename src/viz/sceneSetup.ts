import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ContainerData } from '../domain/ContainerData.ts';

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  dispose: () => void;
}

/**
 * Three.js 씬·카메라·OrbitControls 초기화.
 * 관련 기능 ID: SW_Browser_LoadingScene_001
 */
export function createSceneContext(containerEl: HTMLElement): SceneContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1e);

  const camera = new THREE.PerspectiveCamera(
    50,
    containerEl.clientWidth / containerEl.clientHeight,
    0.1,
    10000,
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
  containerEl.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85);
  dir.position.set(1, 2, 1.5);
  scene.add(dir);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const onResize = (): void => {
    const w = containerEl.clientWidth;
    const h = containerEl.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  const dispose = (): void => {
    window.removeEventListener('resize', onResize);
    controls.dispose();
    renderer.dispose();
    containerEl.removeChild(renderer.domElement);
  };

  return { renderer, scene, camera, controls, dispose };
}

/** 적재함 크기에 맞춰 카메라를 바라보게 조정한다. */
export function frameContainer(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  container: ContainerData,
): void {
  const maxDim = Math.max(container.width, container.height, container.depth);
  const cx = container.width / 2;
  const cy = container.height / 2;
  const cz = container.depth / 2;
  controls.target.set(cx, cy, cz);
  camera.position.set(cx + maxDim * 1.4, cy + maxDim * 0.9, cz + maxDim * 1.6);
  controls.update();
}

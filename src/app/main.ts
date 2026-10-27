import { ContainerData } from '../domain/ContainerData.ts';
import { expandPackageTypes } from '../domain/PackageData.ts';
import { LoadingVisualizer } from '../viz/LoadingVisualizer.ts';
import { createSceneContext, frameContainer } from '../viz/sceneSetup.ts';
import { mountControlPanel, type LoadingFormState } from './ui.ts';

const viewport = document.querySelector('#viewport') as HTMLElement;
const panel = document.querySelector('#panel') as HTMLElement;

const ctx = createSceneContext(viewport);
const visualizer = new LoadingVisualizer(ctx.scene);

function applyToScene(state: LoadingFormState): void {
  const container = ContainerData.fromDimensions(state.container);
  const packages = expandPackageTypes(state.packageTypes);
  visualizer.rebuild(container, packages);
  frameContainer(ctx.camera, ctx.controls, container);
}

mountControlPanel(panel, applyToScene);

applyToScene({
  container: { width: 240, height: 200, depth: 400 },
  packageTypes: [
    { baseId: 'pkg-1', width: 40, height: 30, depth: 50, quantity: 2 },
  ],
});

function animate(): void {
  requestAnimationFrame(animate);
  ctx.controls.update();
  ctx.renderer.render(ctx.scene, ctx.camera);
}
animate();

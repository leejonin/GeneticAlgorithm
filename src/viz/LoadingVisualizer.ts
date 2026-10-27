import * as THREE from 'three';
import type { ContainerData } from '../domain/ContainerData.ts';
import type { PackageData } from '../domain/PackageData.ts';

const CONTAINER_GROUP = 'loading-container';
const PACKAGES_GROUP = 'loading-packages';

const PACKAGE_COLORS = [
  0x4a90d9, 0x50c878, 0xe8a838, 0xc678dd, 0x56b6c2, 0xe06c75,
];

/**
 * 적재함·택배 3D 메시 생성 및 갱신. 1단계는 미리보기용 바닥 격자 배치만 수행한다.
 * 관련 기능 ID: SW_Browser_LoadingScene_001
 */
export class LoadingVisualizer {
  private readonly scene: THREE.Scene;
  private containerGroup: THREE.Group | null = null;
  private packagesGroup: THREE.Group | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /** 적재함 와이어프레임과 택배 메시를 모두 다시 만든다. */
  rebuild(container: ContainerData, packages: PackageData[]): void {
    this.clearGroup(CONTAINER_GROUP);
    this.clearGroup(PACKAGES_GROUP);

    this.containerGroup = this.buildContainerMesh(container);
    this.containerGroup.name = CONTAINER_GROUP;
    this.scene.add(this.containerGroup);

    this.packagesGroup = this.buildPreviewPackages(container, packages);
    this.packagesGroup.name = PACKAGES_GROUP;
    this.scene.add(this.packagesGroup);
  }

  private clearGroup(name: string): void {
    const existing = this.scene.getObjectByName(name);
    if (existing) {
      this.scene.remove(existing);
      this.disposeObject(existing);
    }
  }

  private buildContainerMesh(container: ContainerData): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(container.width, container.height, container.depth);
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x88aaff }),
    );
    line.position.set(
      container.width / 2,
      container.height / 2,
      container.depth / 2,
    );
    group.add(line);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(container.width, container.depth),
      new THREE.MeshStandardMaterial({
        color: 0x2a2a35,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(container.width / 2, 0.001, container.depth / 2);
    group.add(floor);

    geo.dispose();
    return group;
  }

  /**
   * 바닥(y=0)에서 X→Z 순으로 나열. 적재함 밖이면 다음 줄로 넘긴다(미리보기 전용).
   */
  private buildPreviewPackages(
    container: ContainerData,
    packages: PackageData[],
  ): THREE.Group {
    const group = new THREE.Group();
    let cursorX = 0;
    let cursorZ = 0;
    let rowMaxDepth = 0;

    packages.forEach((pkg, index) => {
      if (cursorX + pkg.width > container.width) {
        cursorX = 0;
        cursorZ += rowMaxDepth;
        rowMaxDepth = 0;
      }

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(pkg.width, pkg.height, pkg.depth),
        new THREE.MeshStandardMaterial({
          color: PACKAGE_COLORS[index % PACKAGE_COLORS.length],
          transparent: true,
          opacity: 0.92,
        }),
      );
      mesh.position.set(
        cursorX + pkg.width / 2,
        pkg.height / 2,
        cursorZ + pkg.depth / 2,
      );
      mesh.userData.packageId = pkg.id;
      group.add(mesh);

      cursorX += pkg.width;
      rowMaxDepth = Math.max(rowMaxDepth, pkg.depth);
    });

    return group;
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
      if (child instanceof THREE.LineSegments) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }
}

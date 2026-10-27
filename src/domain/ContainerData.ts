/**
 * 적재함 내부 크기. 원점(0,0,0)에서 +X 가로, +Y 높이, +Z 깊이 방향으로 확장한다.
 * 관련 기능 ID: SW_Browser_LoadingScene_001
 */
export interface ContainerDimensions {
  width: number;
  height: number;
  depth: number;
}

export class ContainerData {
  readonly width: number;
  readonly height: number;
  readonly depth: number;

  constructor(width: number, height: number, depth: number) {
    if (width <= 0 || height <= 0 || depth <= 0) {
      throw new Error('적재함 가로·세로·높이는 0보다 커야 합니다.');
    }
    this.width = width;
    this.height = height;
    this.depth = depth;
  }

  static fromDimensions(d: ContainerDimensions): ContainerData {
    return new ContainerData(d.width, d.height, d.depth);
  }
}

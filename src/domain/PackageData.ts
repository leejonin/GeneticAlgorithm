/**
 * 택배 한 개 인스턴스. 수량 > 1이면 baseId-1, baseId-2 … 로 ID를 부여한다.
 * 관련 기능 ID: SW_Browser_LoadingScene_001
 */
export interface PackageDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface PackageTypeInput {
  baseId: string;
  width: number;
  height: number;
  depth: number;
  quantity: number;
}

export class PackageData {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly depth: number;

  constructor(id: string, width: number, height: number, depth: number) {
    if (!id.trim()) {
      throw new Error('택배 ID는 비어 있을 수 없습니다.');
    }
    if (width <= 0 || height <= 0 || depth <= 0) {
      throw new Error('택배 크기는 0보다 커야 합니다.');
    }
    this.id = id.trim();
    this.width = width;
    this.height = height;
    this.depth = depth;
  }
}

/**
 * UI 한 줄(종류·수량)을 개별 PackageData 목록으로 펼친다.
 * quantity === 1 → baseId, quantity > 1 → `${baseId}-1` … `${baseId}-N`
 */
export function expandPackageTypes(types: PackageTypeInput[]): PackageData[] {
  const result: PackageData[] = [];
  for (const t of types) {
    const baseId = t.baseId.trim();
    const qty = Math.max(1, Math.floor(t.quantity));
    if (qty === 1) {
      result.push(new PackageData(baseId, t.width, t.height, t.depth));
    } else {
      for (let i = 1; i <= qty; i += 1) {
        result.push(new PackageData(`${baseId}-${i}`, t.width, t.height, t.depth));
      }
    }
  }
  return result;
}

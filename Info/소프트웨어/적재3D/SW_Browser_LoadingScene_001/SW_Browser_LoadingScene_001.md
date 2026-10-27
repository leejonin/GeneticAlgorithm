# SW_Browser_LoadingScene_001 — 적재 3D 씬

- 기능 ID: SW_Browser_LoadingScene_001
- 지시자: 이종인
- 작업자: Composer
- 작성 일시(KST): 2026-10-27
- 관련 기능 ID: 없음
- 관련 계획: [161500_1단계_데이터구조3D공간_plan.md](../../../plan/2026-10-27/161500_1단계_데이터구조3D공간_plan.md)

## 기능의 실제 역할

브라우저에서 적재함 내부 크기와 택배 종류·수량을 입력받고, Three.js 씬에 와이어프레임 적재함과 택배 직육면체를 표시한다. 1단계에서는 배치 최적화·GA 없이 미리보기용 바닥 나열만 한다.

## 코드·설정 위치

| 구분 | 경로 |
|---|---|
| 적재함 데이터 | `src/domain/ContainerData.ts` |
| 택배 데이터·수량 펼치기 | `src/domain/PackageData.ts` — `expandPackageTypes` |
| 단위 placeholder | `src/domain/units.ts` |
| 씬·카메라 | `src/viz/sceneSetup.ts` |
| 메시 갱신 | `src/viz/LoadingVisualizer.ts` |
| UI·진입 | `src/app/ui.ts`, `src/app/main.ts` |

## 택배 ID 규칙 (1단계)

- 수량 1: `baseId` 그대로
- 수량 N>1: `${baseId}-1` … `${baseId}-N`

## 호출·의존 관계

`main.ts` → `mountControlPanel` → (적용) → `ContainerData` / `expandPackageTypes` → `LoadingVisualizer.rebuild` → `frameContainer`

## 확인 방법

- `npm run build` — TypeScript·Vite 빌드 성공
- `npm run dev` — 브라우저에서 적재함·택배 크기·수량 변경 후 「씬에 적용」

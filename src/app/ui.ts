import type { ContainerDimensions } from '../domain/ContainerData.ts';
import type { PackageTypeInput } from '../domain/PackageData.ts';
import { LENGTH_UNIT_LABEL } from '../domain/units.ts';

export interface LoadingFormState {
  container: ContainerDimensions;
  packageTypes: PackageTypeInput[];
}

export type ApplyHandler = (state: LoadingFormState) => void;

let packageRowCounter = 0;

/**
 * 적재함·택배 입력 패널. 「씬에 적용」 시 onApply 호출.
 * 관련 기능 ID: SW_Browser_LoadingScene_001
 */
export function mountControlPanel(panelEl: HTMLElement, onApply: ApplyHandler): void {
  panelEl.innerHTML = '';

  const title = document.createElement('h1');
  title.textContent = '택배 적재 (1단계)';
  panelEl.appendChild(title);

  const unitHint = document.createElement('p');
  unitHint.className = 'hint';
  unitHint.textContent = `길이 단위: ${LENGTH_UNIT_LABEL} (입력값 = 3D 월드 1:1)`;
  panelEl.appendChild(unitHint);

  const containerSection = document.createElement('section');
  containerSection.innerHTML = '<h2>적재함 (내부)</h2>';
  const cw = createNumberInput('가로', 240);
  const ch = createNumberInput('높이', 200);
  const cd = createNumberInput('깊이', 400);
  containerSection.appendChild(wrapRow3([cw, ch, cd]));
  panelEl.appendChild(containerSection);

  const pkgSection = document.createElement('section');
  pkgSection.innerHTML = '<h2>택배 종류</h2>';
  const pkgList = document.createElement('div');
  pkgList.id = 'package-list';
  pkgSection.appendChild(pkgList);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'secondary';
  addBtn.textContent = '+ 택배 종류 추가';
  addBtn.addEventListener('click', () => {
    pkgList.appendChild(createPackageRow(`pkg-${++packageRowCounter}`));
  });
  pkgSection.appendChild(addBtn);
  panelEl.appendChild(pkgSection);

  pkgList.appendChild(createPackageRow('pkg-1'));

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.className = 'primary';
  applyBtn.textContent = '씬에 적용';
  applyBtn.addEventListener('click', () => {
    try {
      const state = readForm(cw.input, ch.input, cd.input, pkgList);
      onApply(state);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg);
    }
  });
  panelEl.appendChild(applyBtn);
}

function wrapRow3(fields: { label: string; input: HTMLInputElement }[]): HTMLElement {
  const div = document.createElement('div');
  div.className = 'row-3';
  for (const f of fields) {
    const wrap = document.createElement('div');
    const lab = document.createElement('label');
    lab.textContent = f.label;
    wrap.appendChild(lab);
    wrap.appendChild(f.input);
    div.appendChild(wrap);
  }
  return div;
}

function createNumberInput(label: string, defaultValue: number): {
  label: string;
  input: HTMLInputElement;
} {
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.step = '1';
  input.value = String(defaultValue);
  return { label, input };
}

function createPackageRow(defaultId: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'package-row';

  const header = document.createElement('header');
  const idInput = document.createElement('input');
  idInput.type = 'text';
  idInput.value = defaultId;
  idInput.style.marginBottom = '0';
  header.appendChild(idInput);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'danger';
  removeBtn.textContent = '삭제';
  removeBtn.addEventListener('click', () => row.remove());
  header.appendChild(removeBtn);
  row.appendChild(header);

  const w = createNumberInput('가로', 40);
  const h = createNumberInput('높이', 30);
  const d = createNumberInput('깊이', 50);
  const q = createNumberInput('수량', 1);
  q.input.min = '1';
  row.appendChild(wrapRow3([w, h, d]));
  const qtyWrap = document.createElement('div');
  qtyWrap.style.marginTop = '0.35rem';
  const qtyLab = document.createElement('label');
  qtyLab.textContent = '수량';
  qtyWrap.appendChild(qtyLab);
  qtyWrap.appendChild(q.input);
  row.appendChild(qtyWrap);

  row.dataset.packageRow = '1';

  return row;
}

function getPackageRowInputs(row: Element): {
  idInput: HTMLInputElement;
  widthInput: HTMLInputElement;
  heightInput: HTMLInputElement;
  depthInput: HTMLInputElement;
  qtyInput: HTMLInputElement;
} {
  const inputs = row.querySelectorAll('input');
  const idInput = row.querySelector('header input[type="text"]') as HTMLInputElement;
  const numberInputs = [...inputs].filter((i) => i.type === 'number');
  if (numberInputs.length < 4) {
    throw new Error('택배 입력 행 형식이 올바르지 않습니다.');
  }
  return {
    idInput,
    widthInput: numberInputs[0]!,
    heightInput: numberInputs[1]!,
    depthInput: numberInputs[2]!,
    qtyInput: numberInputs[3]!,
  };
}

function readForm(
  cw: HTMLInputElement,
  ch: HTMLInputElement,
  cd: HTMLInputElement,
  pkgList: HTMLElement,
): LoadingFormState {
  const container = {
    width: parsePositive(cw.value, '적재함 가로'),
    height: parsePositive(ch.value, '적재함 높이'),
    depth: parsePositive(cd.value, '적재함 깊이'),
  };

  const rows = pkgList.querySelectorAll('.package-row');
  if (rows.length === 0) {
    throw new Error('택배 종류를 하나 이상 추가하세요.');
  }

  const packageTypes: PackageTypeInput[] = [];
  rows.forEach((node) => {
    const row = getPackageRowInputs(node);
    packageTypes.push({
      baseId: row.idInput.value,
      width: parsePositive(row.widthInput.value, '택배 가로'),
      height: parsePositive(row.heightInput.value, '택배 높이'),
      depth: parsePositive(row.depthInput.value, '택배 깊이'),
      quantity: parsePositive(row.qtyInput.value, '수량'),
    });
  });

  return { container, packageTypes };
}

function parsePositive(raw: string, field: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${field}는 0보다 큰 숫자여야 합니다.`);
  }
  return n;
}

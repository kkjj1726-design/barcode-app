let activeSlot = null;
let scaleH = 1;

// screen4 이미지 실제 표시 영역 계산 후 슬롯 위치 맞추기
function positionSlots() {
  const bgImg = document.getElementById('screen4-img');
  const container = document.getElementById('location-inputs');
  if (!bgImg || !container) return;

  const screenW = bgImg.offsetWidth;
  const screenH = bgImg.offsetHeight;
  const natW = bgImg.naturalWidth;
  const natH = bgImg.naturalHeight;

  // object-fit: contain 계산
  const scale = Math.min(screenW / natW, screenH / natH);
  const imgW = natW * scale;
  const imgH = natH * scale;
  const imgLeft = (screenW - imgW) / 2;
  const imgTop = (screenH - imgH) / 2;

  // screen4 이미지 기준 카드 위치 (원본 이미지 비율 기준)
  // 원본: 734 x 1536px 기준으로 카드 3개 위치
  // 실측값 기반 고정 계산 (imgH=824, screenH=824 기준)
  scaleH = imgH / 824;
  const cardLeft  = imgLeft + imgW * 0.115;
  const cardWidth = imgW * 0.775;
  const card1Top  = imgTop + 253 * scaleH;
  const card1H    = 130 * scaleH;
  const card2Top  = card1Top + 155 * scaleH;
  const card2H    = card1H;
  const card3Top  = card1Top + 310 * scaleH;
  const card3H    = card1H;
  const headerPx  = 38;
  const headerRatio = headerPx / 130;

  container.style.left   = cardLeft + 'px';
  container.style.top    = card1Top + 'px';
  container.style.width  = cardWidth + 'px';
  container.style.height = (card3Top + card3H - card1Top) + 'px';

  const cards = [
    { top: 0,                    h: card1H },
    { top: card2Top - card1Top,  h: card2H },
    { top: card3Top - card1Top,  h: card3H },
  ];

  cards.forEach((c, i) => {
    const slot   = document.getElementById('slot'  + (i+1));
    const header = document.getElementById('label' + (i+1));
    const body   = slot.querySelector('.loc-body');
    const plus   = document.getElementById('plus'  + (i+1));
    const headerH = Math.round(38 * scaleH);
    const bodyH   = Math.round(c.h) - headerH;

    slot.style.position = 'absolute';
    slot.style.top    = Math.round(c.top) + 'px';
    slot.style.left   = '0';
    slot.style.width  = '100%';
    slot.style.height = Math.round(c.h) + 'px';

    header.style.height     = headerH + 'px';
    header.style.lineHeight = headerH + 'px';
    header.style.fontSize   = Math.max(headerH * 0.42, 10) + 'px';
    header.style.display    = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'center';

    body.style.height     = bodyH + 'px';
    body.style.display    = 'flex';
    body.style.alignItems = 'center';
    body.style.justifyContent = 'center';

    if (plus && plus.style.display !== 'none') {
      plus.style.fontSize = Math.max(bodyH * 0.45, 14) + 'px';
    }

    // 기본 텍스트 (입력 전)
    if (!header.dataset.filled) {
      header.textContent = '로케이션 ' + (i + 1);
      header.style.color = 'rgba(255,255,255,0.45)';
    }
  });
}

function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  if (screenId === 'screen4') {
    const img = document.getElementById('screen4-img');
    if (img.complete) positionSlots();
    else img.onload = positionSlots;
  }
  if (screenId !== 'screen4') resetScreen4();
}

function resetScreen4() {
  [1, 2, 3].forEach(i => {
    const img    = document.getElementById('img'   + i);
    const plus   = document.getElementById('plus'  + i);
    const header = document.getElementById('label' + i);
    if (img)  img.style.display  = 'none';
    if (plus) plus.style.display = 'block';
    header.textContent    = '로케이션 ' + i;
    header.style.color    = 'rgba(255,255,255,0.5)';
    delete header.dataset.filled;
  });
}

function openInput(slotNum) {
  activeSlot = slotNum;
  document.getElementById('modal-title').textContent = '로케이션 ' + slotNum + ' 입력';
  document.getElementById('modal-input').value = '';
  document.getElementById('modal-canvas').style.display = 'none';
  document.getElementById('input-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-input').focus(), 100);
}

function updatePreview() {
  const val    = document.getElementById('modal-input').value.trim();
  const canvas = document.getElementById('modal-canvas');
  if (val.length > 0) {
    try {
      JsBarcode(canvas, val, { format:'CODE128', width:2, height:80, displayValue:true, fontSize:14, margin:10 });
      canvas.style.display    = 'block';
      canvas.style.width      = '100%';
      canvas.style.maxHeight  = '100px';
    } catch(e) { canvas.style.display = 'none'; }
  } else {
    canvas.style.display = 'none';
  }
}

function cancelInput() {
  document.getElementById('input-modal').style.display = 'none';
  activeSlot = null;
}

function confirmInput() {
  const val = document.getElementById('modal-input').value.trim();
  if (!val || !activeSlot) return;

  const img    = document.getElementById('img'   + activeSlot);
  const header = document.getElementById('label' + activeSlot);
  const body   = img.parentElement;
  const bodyH  = Math.round(body.offsetHeight);
  const temp   = document.createElement('canvas');

  try {
    const bodyH = Math.round(130 * scaleH) - Math.round(38 * scaleH);
    JsBarcode(temp, val, { format:'CODE128', width:1.5, height: Math.max(bodyH - 34, 20), displayValue:false, margin:4 });
    img.src             = temp.toDataURL('image/png');
    img.style.display   = 'block';
    const plus = document.getElementById('plus' + activeSlot);
    if (plus) plus.style.display = 'none';
    header.textContent       = val;
    header.style.color       = '#fff';
    header.dataset.filled    = 'true';
  } catch(e) {
    alert('올바른 바코드 값을 입력해주세요.');
    return;
  }

  document.getElementById('input-modal').style.display = 'none';
  activeSlot = null;
}

// 초기 로드 시 screen4가 보이면 위치 계산
window.addEventListener('load', () => {
  const img = document.getElementById('screen4-img');
  if (img) {
    if (img.complete) positionSlots();
    else img.onload = positionSlots;
  }
});
window.addEventListener('resize', positionSlots);
import faceImageSrc from '../../assets/face.svg';

export function loadFaceImages(callback) {
  const img = new Image();
  img.src = faceImageSrc;
  img.onload = callback;
  return img;
}

// 渲染笑脸
export function renderFace(ctx, state, image, { w, x, y }) {
  const stateMap = {
    "unpressed": 0,
    "playing": 0,
    "active": 1,  // 揭开新的，持续一下就变回unpressed
    "win": 2,
    "lose": 3,
  }
  const originW = 20;
  const p = 4;
  ctx.drawImage(image, originW * stateMap[state], 0, originW, originW, x + p, y + p, w - p * 2, w - p * 2);
}

// 画face的背景
export function drawFaceBg(ctx, img, { w, x, y }) {
  // const img = new Image();
  // img.src = `assets/face-bg.svg`;
  // img.onload = ;
  const p = 2;
  w += p * 2;
  ctx.drawImage(img, x - p, y - p, w, w);
}
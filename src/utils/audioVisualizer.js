// Initialize Audio Context and Analyser
export const setupAudioContext = (audioElement) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audioElement);
  
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.82;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  return { audioContext, analyser, dataArray, source };
};

const getLogarithmicFrequencies = (dataArray, numBars = 128) => {
  const result = new Uint8Array(numBars);
  const minIndex = 2; 
  const maxIndex = Math.min(250, dataArray.length - 1);
  
  const logMin = Math.log10(minIndex);
  const logMax = Math.log10(maxIndex);
  
  for (let i = 0; i < numBars; i++) {
    const rangeStart = Math.pow(10, logMin + (i / numBars) * (logMax - logMin));
    const rangeEnd = Math.pow(10, logMin + ((i + 1) / numBars) * (logMax - logMin));
    
    let sum = 0;
    let count = 0;
    const startIndex = Math.floor(rangeStart);
    const endIndex = Math.max(startIndex + 1, Math.floor(rangeEnd));
    
    for (let j = startIndex; j < endIndex; j++) {
      if (j < dataArray.length) {
        sum += dataArray[j];
        count++;
      }
    }
    
    const average = count > 0 ? sum / count : 0;
    const highFreqBoost = 1 + (i / numBars) * 0.4; 
    result[i] = Math.min(255, average * highFreqBoost);
  }
  
  return result;
};

const applyHanningWindowEdge = (normalizedValue, index, totalLength) => {
  const position = index / (totalLength - 1); 
  let rollOff = 1.0;
  if (position < 0.05) {
    rollOff = Math.sin((position / 0.05) * (Math.PI / 2)); 
  } else if (position > 0.95) {
    rollOff = Math.sin(((1.0 - position) / 0.05) * (Math.PI / 2));
  }
  return normalizedValue * rollOff;
};

// --- FX Utilities ---

const drawEmbers = (ctx, width, height) => {
  const time = Date.now() / 1000;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 60; i++) {
    // Pseudo-random deterministic based on index
    const seedX = Math.sin(i * 123.45) * 10000;
    const startX = width * Math.abs(seedX - Math.floor(seedX));
    
    const speed = 50 + Math.abs(Math.sin(i * 987.65)) * 100;
    const rawY = height - ((time * speed + i * 100) % (height * 1.5));
    // Swaying motion
    const sway = Math.sin(time * 2 + i) * 30;
    const x = startX + sway;
    
    const size = 1 + Math.abs(Math.cos(i * 321.12)) * 3;
    const alpha = Math.max(0, 1 - (height - rawY) / height);
    
    ctx.beginPath();
    ctx.arc(x, rawY, size, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.8})`;
    ctx.fill();
    
    // Faux Glow instead of shadowBlur (Fix for critical site freeze)
    ctx.beginPath();
    ctx.arc(x, rawY, size * 3.5, 0, 2 * Math.PI);
    const gradient = ctx.createRadialGradient(x, rawY, 0, x, rawY, size * 3.5);
    gradient.addColorStop(0, `rgba(255, 150, 0, ${alpha * 0.4})`);
    gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill(); 
  }
  ctx.restore();
};

const applyVHSGlitch = (ctx, width, height, subBassRatio) => {
  ctx.save();
  // Scanlines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
  
  // Glitch slices on heavy bass
  if (subBassRatio > 0.7) {
    const numSlices = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < numSlices; i++) {
      const sliceY = Math.random() * height;
      const sliceH = Math.random() * 30 + 5;
      const shiftX = (Math.random() - 0.5) * 50 * subBassRatio;
      
      const sliceData = ctx.getImageData(0, sliceY, width, sliceH);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, sliceY, width, sliceH); // clear
      ctx.putImageData(sliceData, shiftX, sliceY); // re-draw shifted
    }
  }
  ctx.restore();
};

const applyAberration = (ctx, width, height, subBassRatio) => {
  if (subBassRatio < 0.4) return;
  const offset = subBassRatio * 15;
  
  // Create an offscreen snapshot of current canvas containing black bg + visualizer
  const canvasSnapshot = document.createElement('canvas');
  canvasSnapshot.width = width;
  canvasSnapshot.height = height;
  const snapCtx = canvasSnapshot.getContext('2d');
  snapCtx.drawImage(ctx.canvas, 0, 0);
  
  ctx.save();
  // We use screen blending. Since black + black = black, the pure black background remains #000000.
  // The bright visualizers will "ghost" and duplicate outwards with 50% opacity,
  // creating a highly performant Aberration/Ghosting glitch on bass hits without tinting.
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.5;
  
  // Shift left
  ctx.drawImage(canvasSnapshot, -offset, 0);
  // Shift right
  ctx.drawImage(canvasSnapshot, offset, 0);
  // Shift UP
  ctx.drawImage(canvasSnapshot, 0, -offset);
  
  ctx.restore();
};

// V13: Shift a hex color's hue by a given number of degrees
const shiftHexColor = (hex, degrees) => {
  if (!hex) return '#c084fc';
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d) + (g < b ? 6 : 0);
    else if (max === g) h = ((b - r) / d) + 2;
    else if (max === b) h = ((r - g) / d) + 4;
    h /= 6;
  }
  h = ((h * 360 + degrees) % 360 + 360) % 360;
  // ensure good saturation/lightness for visualizer
  s = Math.max(s, 0.7);
  l = Math.min(Math.max(l, 0.5), 0.75);
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const applyPixelate = (ctx, width, height) => {
  const pixelSize = 8;
  const w = width / pixelSize;
  const h = height / pixelSize;
  
  const canvasSnapshot = document.createElement('canvas');
  canvasSnapshot.width = w;
  canvasSnapshot.height = h;
  const snapCtx = canvasSnapshot.getContext('2d');
  
  snapCtx.imageSmoothingEnabled = false;
  snapCtx.drawImage(ctx.canvas, 0, 0, w, h);
  
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(canvasSnapshot, 0, 0, width, height);
};

// --- Main Engine ---

export const drawVisualizer = (canvas, analyser, dataArray, config, isPaused = false) => {
  const { style, layout, albumImg, songTitle, activeFX = {}, coverPosition, customHexColor } = config;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas - Pure Black
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // V13: Only update the frequency data if the audio is playing.
  // This prevents the bars from decaying to zero when the user is paused and changing settings.
  if (analyser && !isPaused) {
    analyser.getByteFrequencyData(dataArray);
  }
  
  const numVisualBands = 120;
  const activeDataArray = getLogarithmicFrequencies(dataArray, numVisualBands);

  // Sub-bass extraction for FX constraints (MUST occur BEFORE amplitude scaling)
  let subBassSum = 0;
  for(let i=0; i<6; i++) {
    subBassSum += activeDataArray[i];
  }
  let subBassAvg = (subBassSum / 6) / 255;
  const subBassPow = Math.pow(subBassAvg, 1.5);

  // V12 Custom Amplitude Scaling 
  const ampScalar = config.amplitude !== undefined ? config.amplitude : 1;
  for (let i = 0; i < activeDataArray.length; i++) {
    activeDataArray[i] = activeDataArray[i] * ampScalar;
  }
  
  // FX: Shake (Pre-render coordinate shift)
  let offsetX = 0;
  let offsetY = 0;
  if (activeFX.shake && subBassPow > 0.5) {
    offsetX = (Math.random() - 0.5) * 30 * subBassPow;
    offsetY = (Math.random() - 0.5) * 30 * subBassPow;
  }

  // FX: Embers (Background Post-Black)
  if (activeFX.embers) {
    drawEmbers(ctx, width, height);
  }

  // V13: Direct color resolution — no more broken hueShift offsets
  let colorA, colorB;
  if (activeFX.rainbow) {
    const hue = (Date.now() / 20) % 360;
    colorA = `hsl(${hue}, 100%, 70%)`;
    colorB = `hsl(${(hue + 80) % 360}, 100%, 70%)`;
  } else {
    colorA = customHexColor || '#c084fc';
    colorB = config.secondaryHexColor || shiftHexColor(colorA, 60);
  }

  // Render Inner Graphics Wrapper
  const renderCore = (scaleY = 1, fadeAlpha = 1) => {
    ctx.save();
    ctx.translate(offsetX, offsetY); // Shake logic

    let vX = 0;
    let vY = 0;
    let vW = width;
    let vH = height;

    // V13: Height multiplier for Clean and Cover modes
    const barHeightScale = config.barHeight || 1;

    if (layout === 'clean') {
      const paddingX = width * 0.1;
      const paddingY = height * 0.1;
      vX = paddingX;
      // Center vertically within the original padding
      vY = paddingY + (height * 0.8 * (1 - barHeightScale) * 0.5); 
      vW = width - (paddingX * 2);
      vH = height * 0.8 * barHeightScale;

    } else if (layout === 'mini-cover') {
      const padding = height * 0.15;
      const coverSize = height * 0.35; 
      const coverXLeft = width * 0.1;
      vH = (height - (padding * 3)) * barHeightScale;
      vX = coverPosition === 'right' ? padding * 2 : coverXLeft + coverSize + (width * 0.05);
      vY = (height - vH) / 2;
      vW = width - coverSize - (padding * 4) - (width * 0.05);

    } else if (layout === 'title') {
      const paddingX = width * 0.15;
      const isBarsDown = style === 'bars-down';
      const vizYFactor = isBarsDown ? 0.5 : 0.1;

      vX = paddingX;
      vY = height * vizYFactor;
      vW = width - (paddingX * 2);
      vH = height * 0.4; 
    }

    // Mirroring Transformations
    ctx.save();
    if (scaleY === -1) {
      ctx.translate(0, vY * 2 + vH);
      ctx.scale(1, -1);
    }
    
    ctx.translate(vX, vY);
    ctx.globalAlpha = fadeAlpha;
    
    if (activeFX.glow) {
      ctx.shadowColor = colorA;
      ctx.shadowBlur = 20 * (height / 1080);
    } else {
      ctx.shadowBlur = 0;
    }
    
    if (style.startsWith('bars')) drawBars(ctx, vW, vH, activeDataArray, style, colorA, colorB);
    else if (style === 'circle') drawCircle(ctx, vW, vH, activeDataArray, colorA, colorB);
    else if (style.startsWith('wave-circle')) drawWaveCircle(ctx, vW, vH, activeDataArray, colorA, colorB);
    else if (style.startsWith('wave')) drawWave(ctx, vW, vH, activeDataArray, style, colorA, colorB);
    else if (style === 'particles') drawParticles(ctx, vW, vH, activeDataArray, colorA, colorB);
    else if (style === 'pulse') drawPulse(ctx, vW, vH, activeDataArray, colorA, colorB);
    
    ctx.restore();
    ctx.restore(); // end shake translate
  };

  // Render Pass 1: Original
  renderCore(1, 1);

  // FX: Mirror Floor
  if (activeFX.mirror) {
    renderCore(-1, 0.25); // inverted, 25% opacity
  }

  // FX: Flash Bang (Whiteout)
  if (activeFX.flash && subBassPow > 0.8) {
    ctx.fillStyle = `rgba(255, 255, 255, ${(subBassPow - 0.7) * 2})`;
    ctx.fillRect(0, 0, width, height);
  }

  // FX: Aberration
  if (activeFX.aberration) {
    applyAberration(ctx, width, height, subBassPow);
  }

  // FX: VHS Glitch
  if (activeFX.vhs) {
    applyVHSGlitch(ctx, width, height, subBassPow);
  }

  // FX: Pixelate
  if (activeFX.pixelate) {
    applyPixelate(ctx, width, height);
  }

  // --- UI OVERLAYS (Immune to FX) ---
  
  // Isolate drawing state from any global alterations done by Glitch passes
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.imageSmoothingEnabled = true; // Recover from Pixelate

  // 1. Draw Images Immune to FX
  const imgT = config.imgTransform || {};
  const imgScale = imgT.imgSize || 1;
  const imgOX = (imgT.imgOffsetX || 0) * (height / 1080);
  const imgOY = (imgT.imgOffsetY || 0) * (height / 1080);
  const imgRot = (imgT.imgRotation || 0) * (Math.PI / 180);
  const imgBlurVal = imgT.imgBlur || 0;
  const imgBW = (imgT.imgBorderWidth || 0) * (height / 1080);
  const imgBC = imgT.imgBorderColor || '#ffffff';

  if (layout === 'clean' && albumImg && (style === 'circle' || style === 'wave-circle' || style === 'pulse')) {
      const paddingX = width * 0.1;
      const paddingY = height * 0.1;
      const vW = width - (paddingX * 2);
      const vH = height - (paddingY * 2);
      const baseRadius = Math.min(vW, vH) * 0.25;
      const radius = baseRadius * imgScale;
      
      const cx = (width / 2) + imgOX;
      const cy = (height / 2) + imgOY;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(imgRot);
      
      if (imgBlurVal > 0) ctx.filter = `blur(${imgBlurVal}px)`;
      
      // Border
      if (imgBW > 0) {
        ctx.beginPath();
        const shape = config.imageShape || 'circle';
        if (shape === 'square') {
          const r = 10 * (height / 1080);
          ctx.roundRect(-radius - imgBW, -radius - imgBW, (radius + imgBW) * 2, (radius + imgBW) * 2, r);
        } else if (shape === 'rounded') {
          const r = Math.min(60 * (height / 1080), radius + imgBW);
          ctx.roundRect(-radius - imgBW, -radius - imgBW, (radius + imgBW) * 2, (radius + imgBW) * 2, r);
        } else {
          ctx.arc(0, 0, radius * 0.95 + imgBW, 0, 2 * Math.PI);
        }
        ctx.fillStyle = imgBC;
        ctx.fill();
      }
      
      ctx.beginPath();
      const shape = config.imageShape || 'circle';
      if (shape === 'square') {
        const r = 10 * (height / 1080);
        ctx.roundRect(-radius, -radius, radius * 2, radius * 2, r);
      } else if (shape === 'rounded') {
        const r = Math.min(60 * (height / 1080), radius);
        ctx.roundRect(-radius, -radius, radius * 2, radius * 2, r);
      } else {
        ctx.arc(0, 0, radius * 0.95, 0, 2 * Math.PI); 
      }
      
      ctx.clip();
      ctx.drawImage(albumImg, -radius, -radius, radius * 2, radius * 2);
      ctx.filter = 'none';
      ctx.restore();

  } else if (layout === 'mini-cover') {
      const padding = height * 0.15;
      const vY = padding * 1.5;
      const vH = height - (padding * 3);
      const baseCoverSize = height * 0.35;
      const coverSize = baseCoverSize * imgScale;
      
      let coverY = (height - coverSize) / 2; 
      if (style.startsWith('bars') && style !== 'bars-sym' && style !== 'bars-down') {
        coverY = vY + vH - coverSize;
      } else if (style === 'bars-down') {
        coverY = vY;
      } else if (style.startsWith('wave') && style !== 'wave-sym' && style !== 'wave-circle') {
        coverY = vY + vH - coverSize;
      } else if (style === 'particles') {
        coverY = vY + vH - coverSize;
      }

      const coverXLeft = width * 0.1;
      const coverXRight = width - coverSize - (width * 0.1);
      const imageX = coverPosition === 'right' ? coverXRight : coverXLeft;
      
      const cx = imageX + coverSize / 2 + imgOX;
      const cy = coverY + coverSize / 2 + imgOY;

      if (albumImg) { 
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(imgRot);
        
        if (imgBlurVal > 0) ctx.filter = `blur(${imgBlurVal}px)`;
        
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = Math.floor(30 * (height / 1080));
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.floor(15 * (height / 1080));
        
        // Border
        if (imgBW > 0) {
          ctx.beginPath();
          const shape = config.imageShape || 'square';
          if (shape === 'circle') {
            ctx.arc(0, 0, coverSize/2 + imgBW, 0, Math.PI * 2);
          } else if (shape === 'rounded') {
            const rad = Math.min(60 * (height / 1080), coverSize / 2 + imgBW);
            ctx.roundRect(-coverSize/2 - imgBW, -coverSize/2 - imgBW, coverSize + imgBW*2, coverSize + imgBW*2, rad);
          } else {
            const rad = 10 * (height / 1080);
            ctx.roundRect(-coverSize/2 - imgBW, -coverSize/2 - imgBW, coverSize + imgBW*2, coverSize + imgBW*2, rad);
          }
          ctx.fillStyle = imgBC;
          ctx.fill();
          ctx.shadowBlur = 0; // don't double-shadow border
        }
        
        ctx.beginPath();
        const shape = config.imageShape || 'square';
        if (shape === 'circle') {
          ctx.arc(0, 0, coverSize/2, 0, Math.PI * 2);
        } else if (shape === 'rounded') {
          const rad = Math.min(60 * (height / 1080), coverSize / 2);
          ctx.roundRect(-coverSize/2, -coverSize/2, coverSize, coverSize, rad);
        } else {
          const rad = 10 * (height / 1080);
          ctx.roundRect(-coverSize/2, -coverSize/2, coverSize, coverSize, rad);
        }
        
        ctx.clip();
        ctx.drawImage(albumImg, -coverSize/2, -coverSize/2, coverSize, coverSize);
        ctx.filter = 'none';
        ctx.restore();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        const shape = config.imageShape || 'square';
        if (shape === 'circle') {
          ctx.arc(cx, cy, coverSize/2, 0, Math.PI * 2);
        } else if (shape === 'rounded') {
          const rad = Math.min(60 * (height / 1080), coverSize / 2);
          ctx.roundRect(cx - coverSize/2, cy - coverSize/2, coverSize, coverSize, rad);
        } else {
          const rad = 10 * (height / 1080);
          ctx.roundRect(cx - coverSize/2, cy - coverSize/2, coverSize, coverSize, rad);
        }
        ctx.fill();
      }
  }

  // 2. Draw Title Text
  if (config.showTitle) {
    let titleYFactor = 0.55;
    if (layout === 'title') {
      titleYFactor = style === 'bars-down' ? 0.35 : 0.55;
    } else {
      titleYFactor = 0.85;
    }
    
    const titleCol = config.titleColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = 80 * (height / 1080);
    const fFamily = config.titleFont || 'Montserrat';
    ctx.font = `900 ${fontSize}px "${fFamily}", "Outfit", sans-serif`;
    const { textStyle = 'solid' } = config;
    const tx = width / 2;
    const ty = height * titleYFactor;
    const titleText = songTitle || 'Unknown Track';

    ctx.fillStyle = titleCol;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;

    if (textStyle === 'neon') {
        ctx.fillStyle = titleCol;
        ctx.shadowColor = colorA;
        ctx.shadowBlur = 40 * (height / 1080);
        ctx.fillText(titleText, tx, ty);
        ctx.shadowBlur = 80 * (height / 1080);
        ctx.fillText(titleText, tx, ty);
    } else if (textStyle === 'outline') {
        ctx.shadowBlur = 10 * (height / 1080);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 4 * (height / 1080);
        ctx.strokeStyle = titleCol;
        ctx.strokeText(titleText, tx, ty);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillText(titleText, tx, ty);
    } else if (textStyle === 'shadow3d') {
        ctx.shadowBlur = 0;
        for (let l = 6; l >= 0; l--) {
          const shade = Math.floor(40 + l * 20);
          ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
          ctx.fillText(titleText, tx + l * 2 * (height/1080), ty + l * 2 * (height/1080));
        }
        ctx.fillStyle = titleCol;
        ctx.fillText(titleText, tx, ty);
    } else if (textStyle === 'glitch') {
        const off = 3 * (height / 1080);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#ff0000';
        ctx.fillText(titleText, tx - off, ty);
        ctx.fillStyle = '#00ffff';
        ctx.fillText(titleText, tx + off, ty);
        ctx.globalAlpha = 1;
        ctx.fillStyle = titleCol;
        ctx.fillText(titleText, tx, ty);
    } else if (textStyle === 'gradient') {
        ctx.shadowBlur = 10;
        const textWidth = ctx.measureText(titleText).width;
        const grad = ctx.createLinearGradient(tx - textWidth/2, 0, tx + textWidth/2, 0);
        grad.addColorStop(0, colorA);
        grad.addColorStop(1, colorB);
        ctx.fillStyle = grad;
        ctx.fillText(titleText, tx, ty);
    } else {
        ctx.fillText(titleText, tx, ty);
    }
  }
  
  ctx.restore(); // Restore global context back to default clean state
};

// --- Child Drawers ---

const drawBars = (ctx, width, height, dataArray, style, colorA, colorB) => {
  const sliceWidth = width / dataArray.length;
  const gap = sliceWidth * 0.2; 
  const barWidth = sliceWidth - gap;
  
  let x = gap / 2;

  const blockHeight = height * 0.02; 
  const blockGap = height * 0.01;

  for (let i = 0; i < dataArray.length; i++) {
    let normalizedVal = dataArray[i] / 255;
    normalizedVal = applyHanningWindowEdge(normalizedVal, i, dataArray.length);
    normalizedVal = Math.pow(normalizedVal, 1.4); 
    
    const barHeight = Math.max(0, normalizedVal * height);
    
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    ctx.fillStyle = gradient;
    
    if (style === 'bars-blocks') {
      const numBlocks = Math.floor(barHeight / (blockHeight + blockGap));
      for (let b = 0; b < numBlocks; b++) {
        const blockY = height - (b * (blockHeight + blockGap)) - blockHeight;
        ctx.fillRect(x, blockY, barWidth, blockHeight);
      }
    } else if (style === 'bars') { 
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    } else if (style === 'bars-down') {
      ctx.fillRect(x, 0, barWidth, barHeight);
    } else if (style === 'bars-sym') { 
      ctx.fillRect(x, (height / 2) - (barHeight / 2), barWidth, barHeight);
    }
    
    x += sliceWidth;
  }
};

const drawCircle = (ctx, width, height, dataArray, colorA, colorB) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  const radius = Math.min(centerX, centerY) * 0.5;
  const maxBarHeight = Math.min(centerX, centerY) * 0.45;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = colorB;
  ctx.lineWidth = 1 * (height / 1080);
  ctx.stroke();

  for (let i = 0; i < dataArray.length; i++) {
    let normalizedVal = dataArray[i] / 255;
    normalizedVal = Math.pow(normalizedVal, 1.3);
    
    const barHeight = normalizedVal * maxBarHeight;
    const angle = (Math.PI * 2 * i) / dataArray.length;
    
    const x1 = centerX + Math.cos(angle) * (radius + (2 * (height/1080)));
    const y1 = centerY + Math.sin(angle) * (radius + (2 * (height/1080)));
    const x2 = centerX + Math.cos(angle) * (radius + barHeight);
    const y2 = centerY + Math.sin(angle) * (radius + barHeight);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    ctx.strokeStyle = colorA;
    ctx.lineWidth = 4 * (height / 1080);
    ctx.lineCap = 'round';
    ctx.stroke();
  }
};

const drawWaveCircle = (ctx, width, height, dataArray, colorA, colorB) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  const baseRadius = Math.min(centerX, centerY) * 0.5;
  const maxAmplitude = Math.min(centerX, centerY) * 0.45;

  ctx.beginPath();
  ctx.strokeStyle = colorB;
  ctx.lineWidth = 4 * (height / 1080);

  for (let i = 0; i <= dataArray.length; i++) {
    const dataIndex = i % dataArray.length; 
    let normalizedVal = dataArray[dataIndex] / 255;
    normalizedVal = Math.pow(normalizedVal, 1.3);
    
    const amplitude = normalizedVal * maxAmplitude;
    const radius = baseRadius + amplitude;
    const angle = (Math.PI * 2 * i) / dataArray.length;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  // Use colorA with transparency for fill
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = colorA;
  ctx.fill();
  ctx.restore();
};

const drawWave = (ctx, width, height, dataArray, style, colorA, colorB) => {
  const sliceWidth = width / (dataArray.length - 1);
  
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  
  for (let i = 0; i < dataArray.length; i++) {
    let normalizedVal = dataArray[i] / 255;
    normalizedVal = applyHanningWindowEdge(normalizedVal, i, dataArray.length);
    normalizedVal = Math.pow(normalizedVal, 1.3);
    
    const amplitude = (normalizedVal * (height * 0.45));
    const y = (height / 2) - amplitude;
    const exactX = i * sliceWidth;

    if (i === 0) {
      ctx.moveTo(0, y);
    } else {
      ctx.lineTo(exactX, y);
    }
  }

  ctx.strokeStyle = colorB;
  ctx.lineWidth = Math.max(2, 4 * (height / 1080));
  ctx.stroke();
  
  if (style === 'wave' || style === 'wave-sym') {
    if (style === 'wave-sym') {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let i = 0; i < dataArray.length; i++) {
        let normalizedVal = dataArray[i] / 255;
        normalizedVal = applyHanningWindowEdge(normalizedVal, i, dataArray.length);
        normalizedVal = Math.pow(normalizedVal, 1.3);
        const amplitude = (normalizedVal * (height * 0.45));
        const y = (height / 2) + amplitude; 
        const exactX = i * sliceWidth;

        if (i === 0) {
          ctx.moveTo(0, y);
        } else {
          ctx.lineTo(exactX, y);
        }
      }
      ctx.strokeStyle = colorA;
      ctx.stroke();
    }
    
    if (style === 'wave') {
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = colorB;
      ctx.fill();
      ctx.restore();
    }
  }
};

const drawParticles = (ctx, width, height, dataArray, colorA, colorB) => {
  const sliceWidth = width / dataArray.length;
  const circleRadiusBase = 4 * (height / 1080);
  
  let x = sliceWidth / 2;

  for (let i = 0; i < dataArray.length; i++) {
    let normalizedVal = dataArray[i] / 255;
    normalizedVal = applyHanningWindowEdge(normalizedVal, i, dataArray.length);
    normalizedVal = Math.pow(normalizedVal, 1.3);
    
    const amplitude = normalizedVal * height;
    
    ctx.beginPath();
    ctx.arc(x, height - amplitude - circleRadiusBase, circleRadiusBase * (0.8 + normalizedVal * 2), 0, 2 * Math.PI);
    // Blend between colorA and colorB based on frequency position
    const t = i / dataArray.length;
    ctx.fillStyle = t < 0.5 ? colorA : colorB;
    ctx.fill();
    
    x += sliceWidth;
  }
};

const drawPulse = (ctx, width, height, dataArray, colorA, colorB) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  let subBassSum = 0;
  for(let i=0; i<6; i++) {
    subBassSum += dataArray[i];
  }
  let subBassAvg = (subBassSum / 6) / 255;
  subBassAvg = Math.pow(subBassAvg, 1.5); 
  
  const baseRadius = Math.min(centerX, centerY) * 0.3;
  const pulseRadius = baseRadius + (subBassAvg * baseRadius * 1.5);
  
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius + (w * subBassAvg * 50 * (height / 1080)), 0, 2 * Math.PI);
    ctx.save();
    ctx.globalAlpha = 0.4 - (w * 0.1);
    ctx.strokeStyle = colorA;
    ctx.lineWidth = (4 - w) * (height / 1080);
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
  const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, pulseRadius);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.5, colorB);
  gradient.addColorStop(1, colorA);
  ctx.fillStyle = gradient;
  ctx.fill();
};

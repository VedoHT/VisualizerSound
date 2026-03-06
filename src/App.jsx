import { useState, useRef } from 'react';
import Uploader from './components/Uploader';
import VisualizerPreview from './components/VisualizerPreview';
import ImageUploader from './components/ImageUploader';
import { t } from './translations';
import './index.css';

function App() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [albumCover, setAlbumCover] = useState(null);
  
  const [selectedStyle, setSelectedStyle] = useState('bars');
  const [layoutType, setLayoutType] = useState('clean');
  
  // V6 FX State
  const [activeFX, setActiveFX] = useState({
    glow: true,
    aberration: false,
    vhs: false,
    mirror: false,
    embers: false,
    pixelate: false,
    shake: false,
    flash: false,
    rainbow: false
  });

  const toggleFX = (fxName) => {
    setActiveFX((prev) => ({ ...prev, [fxName]: !prev[fxName] }));
  };

  const [coverPosition, setCoverPosition] = useState('left');
  const [customHexColor, setCustomHexColor] = useState('#c084fc');
  const [secondaryHexColor, setSecondaryHexColor] = useState('#60a5fa');
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [titleFont, setTitleFont] = useState('Montserrat');
  const [imageShape, setImageShape] = useState('square');
  const [amplitude, setAmplitude] = useState(1.0);
  const [barHeight, setBarHeight] = useState(1.0); // New V13: Limit bar max height percentage
  const [showTitle, setShowTitle] = useState(true);
  const [textStyle, setTextStyle] = useState('solid');
  
  // Image Transform Controls
  const [imgSize, setImgSize] = useState(1.0);
  const [imgOffsetX, setImgOffsetX] = useState(0);
  const [imgOffsetY, setImgOffsetY] = useState(0);
  const [imgRotation, setImgRotation] = useState(0);
  const [imgBorderWidth, setImgBorderWidth] = useState(0);
  const [imgBorderColor, setImgBorderColor] = useState('#ffffff');
  const [imgBlur, setImgBlur] = useState(0);
  
  const [lang, setLang] = useState('pt'); // Default to PT as requested

  const texts = t[lang];

  // Batch Export System V11
  const previewRefs = useRef([]);
  const [isBatchExporting, setIsBatchExporting] = useState(false);

  const removeTrack = (indexToRemove) => {
    setAudioFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    previewRefs.current = previewRefs.current.filter((_, idx) => idx !== indexToRemove);
  };

  const startBatchExport = async (format) => {
    if (audioFiles.length === 0 || isBatchExporting) return;
    setIsBatchExporting(true);

    for (let i = 0; i < previewRefs.current.length; i++) {
        const ref = previewRefs.current[i];
        if (ref) {
            try {
                if (format === 'webm') {
                   await ref.exportWebM();
                } else {
                   await ref.exportMP4();
                }
            } catch (err) {
                console.error(`Export failed for track ${i}`, err);
            }
        }
    }
    
    setIsBatchExporting(false);
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      
      {/* Absolute Language Toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button 
          className="glass-button" 
          onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          {lang === 'en' ? '🇧🇷 PT-BR' : '🇺🇸 EN-US'}
        </button>
      </div>

      <header className="header">
        <h1>{texts.title}</h1>
        <p>{texts.subtitle}</p>
      </header>

      <main>
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <Uploader onAudioAdded={(files) => setAudioFiles(prev => [...prev, ...files])} />
        </div>

        {audioFiles.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(400px, 450px) 1fr', 
            gap: '2rem',
            alignItems: 'start'
          }}>
            {/* LEFT COLUMN: SETTINGS */}
            <div className="glass-panel" style={{ 
              padding: '1.5rem', 
              position: 'sticky', 
              top: '1rem',
              maxHeight: 'calc(100vh - 2rem)',
              overflowY: 'auto'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1.2rem'
              }}>
                
                {/* 1. Visualizer Style */}
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step1}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <button className={`glass-button ${selectedStyle === 'bars' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars')}>{texts.styleBarsUp}</button>
                    <button className={`glass-button ${selectedStyle === 'bars-down' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars-down')}>{texts.styleBarsDown}</button>
                    <button className={`glass-button ${selectedStyle === 'bars-sym' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars-sym')}>{texts.styleBarsSym}</button>
                    <button className={`glass-button ${selectedStyle === 'bars-blocks' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars-blocks')}>{texts.styleBarsBlocks}</button>
                    <button className={`glass-button ${selectedStyle === 'particles' ? 'primary' : ''}`} onClick={() => setSelectedStyle('particles')}>{texts.styleParticles}</button>
                    <button className={`glass-button ${selectedStyle === 'wave' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave')}>{texts.styleWave}</button>
                    <button className={`glass-button ${selectedStyle === 'wave-line' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave-line')}>{texts.styleLineWave}</button>
                    <button className={`glass-button ${selectedStyle === 'wave-sym' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave-sym')}>{texts.styleWaveSym}</button>
                    <button className={`glass-button ${selectedStyle === 'circle' ? 'primary' : ''}`} onClick={() => setSelectedStyle('circle')}>{texts.styleCircle}</button>
                    <button className={`glass-button ${selectedStyle === 'wave-circle' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave-circle')}>{texts.styleWaveCircle}</button>
                    <button className={`glass-button ${selectedStyle === 'pulse' ? 'primary' : ''}`} onClick={() => setSelectedStyle('pulse')}>{texts.stylePulse}</button>
                  </div>
                  <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{texts.amplitude}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(amplitude * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="2.5" step="0.1" value={amplitude} onChange={(e) => setAmplitude(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', marginTop: '0.8rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{texts.barHeight}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(barHeight * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1.5" step="0.05" value={barHeight} onChange={(e) => setBarHeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  </div>
                </div>

                {/* 2. Special FX */}
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step2}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    {Object.keys(activeFX).map(fx => (
                      <label key={fx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={activeFX[fx]} onChange={() => toggleFX(fx)} /> {texts[`fx${fx.charAt(0).toUpperCase() + fx.slice(1)}`]}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Layout */}
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step3}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={`glass-button ${layoutType === 'clean' ? 'primary' : ''}`} onClick={() => setLayoutType('clean')} style={{ flex: 1 }}>{texts.layoutClean}</button>
                    <button className={`glass-button ${layoutType === 'mini-cover' ? 'primary' : ''}`} onClick={() => setLayoutType('mini-cover')} style={{ flex: 1 }}>{texts.layoutMiniCover}</button>
                    <button className={`glass-button ${layoutType === 'title' ? 'primary' : ''}`} onClick={() => setLayoutType('title')} style={{ flex: 1 }}>{texts.layoutTitle}</button>
                  </div>
                </div>
                
                {/* 4. Color System V13 */}
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step4}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '8px' }}>
                      <input type="color" value={customHexColor} onChange={(e) => setCustomHexColor(e.target.value)} style={{ width: '35px', height: '35px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{texts.primaryHue}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '8px' }}>
                      <input type="color" value={secondaryHexColor} onChange={(e) => setSecondaryHexColor(e.target.value)} style={{ width: '35px', height: '35px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{texts.secondaryColor}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{texts.secondaryColorDesc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Title Settings */}
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step5}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} /> {texts.showTitle}
                    </label>

                    {showTitle && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} style={{ width: '30px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }} />
                          <span style={{ fontSize: '0.85rem' }}>{texts.titleColor}</span>
                        </div>
                        <select value={titleFont} onChange={(e) => setTitleFont(e.target.value)} className="glass-button" style={{ textAlign: 'left', padding: '0.4rem', fontSize: '0.85rem', fontFamily: titleFont }}>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Outfit">Outfit</option>
                          <option value="Inter">Inter</option>
                          <option value="Space Grotesk">Space Grotesk</option>
                          <option value="Bebas Neue">Bebas Neue</option>
                          <option value="Righteous">Righteous</option>
                          <option value="Orbitron">Orbitron</option>
                          <option value="Press Start 2P">8-Bit Retro</option>
                          <option value="Syne">Syne</option>
                          <option value="Permanent Marker">Handwritten</option>
                        </select>
                        <select value={textStyle} onChange={(e) => setTextStyle(e.target.value)} className="glass-button" style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                          <option value="solid">{texts.textSolid}</option>
                          <option value="neon">{texts.textNeon}</option>
                          <option value="outline">{texts.textOutline}</option>
                          <option value="shadow3d">{texts.textShadow3d}</option>
                          <option value="glitch">{texts.textGlitch}</option>
                          <option value="gradient">{texts.textGradient}</option>
                        </select>
                      </>
                    )}
                  </div>
                </div>

                {/* 6. Image & Transform */}
                <div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.addCover}</h4>
                  <ImageUploader onImageAdded={(img) => setAlbumCover(img)} />
                  
                  {albumCover && (
                    <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Posição:
                          <select value={coverPosition} onChange={e => setCoverPosition(e.target.value)} className="glass-button" style={{ padding: '0.2rem', marginLeft: '0.5rem' }}>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="center">Center</option>
                          </select>
                        </label>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Forma:
                          <select value={imageShape} onChange={e => setImageShape(e.target.value)} className="glass-button" style={{ padding: '0.2rem', marginLeft: '0.5rem' }}>
                            <option value="square">Square</option>
                            <option value="rounded">Rounded</option>
                            <option value="circle">Circle</option>
                          </select>
                        </label>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem' }}>{texts.imgSize}: {Math.round(imgSize * 100)}%</label>
                          <input type="range" min="0.2" max="3" step="0.05" value={imgSize} onChange={e => setImgSize(Number.parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem' }}>{texts.imgRotation}: {imgRotation}°</label>
                          <input type="range" min="-180" max="180" step="1" value={imgRotation} onChange={e => setImgRotation(Number.parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem' }}>{texts.imgOffsetX}: {imgOffsetX}px</label>
                          <input type="range" min="-500" max="500" step="5" value={imgOffsetX} onChange={e => setImgOffsetX(Number.parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem' }}>{texts.imgOffsetY}: {imgOffsetY}px</label>
                          <input type="range" min="-500" max="500" step="5" value={imgOffsetY} onChange={e => setImgOffsetY(Number.parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem' }}>Blur: {imgBlur}px</label>
                          <input type="range" min="0" max="30" step="1" value={imgBlur} onChange={e => setImgBlur(Number.parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem' }}>Borda: {imgBorderWidth}px</label>
                          <input type="range" min="0" max="20" step="1" value={imgBorderWidth} onChange={e => setImgBorderWidth(Number.parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.7rem' }}>Cor:</label>
                          <input type="color" value={imgBorderColor} onChange={e => setImgBorderColor(e.target.value)} style={{ width: '30px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Batch Export */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="glass-button primary" onClick={() => startBatchExport('mp4')} disabled={isBatchExporting} style={{ padding: '0.8rem' }}>
                    {isBatchExporting ? 'EXPORTANDO...' : `🎬 EXPORTAR TUDO (MP4)`}
                  </button>
                  <button className="glass-button" onClick={() => startBatchExport('webm')} disabled={isBatchExporting} style={{ fontSize: '0.8rem' }}>
                    {isBatchExporting ? '...' : `⬇️ Exportar em WebM (Rápido)`}
                  </button>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: PREVIEWS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {audioFiles.map((file, index) => (
                <VisualizerPreview 
                  key={`${file.name}-${index}`} 
                  ref={el => previewRefs.current[index] = el}
                  file={file} 
                  styleType={selectedStyle}
                  layoutType={layoutType}
                  albumCover={albumCover}
                  activeFX={activeFX}
                  coverPosition={coverPosition}
                  customHexColor={customHexColor}
                  secondaryHexColor={secondaryHexColor}
                  titleColor={titleColor}
                  titleFont={titleFont}
                  imageShape={imageShape}
                  amplitude={amplitude}
                  barHeight={barHeight}
                  showTitle={showTitle}
                  textStyle={textStyle}
                  imgTransform={{ imgSize, imgOffsetX, imgOffsetY, imgRotation, imgBorderWidth, imgBorderColor, imgBlur }}
                  onRemove={() => removeTrack(index)}
                  texts={texts}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

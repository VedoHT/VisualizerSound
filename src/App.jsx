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
  const [titleFont, setTitleFont] = useState('Montserrat');
  const [imageShape, setImageShape] = useState('square');
  const [amplitude, setAmplitude] = useState(1.0);
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
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1.5rem', 
              marginBottom: '2rem', 
              background: 'rgba(0,0,0,0.2)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  {texts.step1}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                
                <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>{texts.amplitude}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(amplitude * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="2.5" 
                    step="0.1" 
                    value={amplitude} 
                    onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{texts.amplitudeDesc}</p>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step2}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.glow} onChange={() => toggleFX('glow')} /> {texts.fxGlow}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.aberration} onChange={() => toggleFX('aberration')} /> {texts.fxAberration}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.vhs} onChange={() => toggleFX('vhs')} /> {texts.fxVhs}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.mirror} onChange={() => toggleFX('mirror')} /> {texts.fxMirror}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.embers} onChange={() => toggleFX('embers')} /> {texts.fxEmbers}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.pixelate} onChange={() => toggleFX('pixelate')} /> {texts.fxPixelate}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.shake} onChange={() => toggleFX('shake')} /> {texts.fxShake}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.flash} onChange={() => toggleFX('flash')} /> {texts.fxFlash}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.rainbow} onChange={() => toggleFX('rainbow')} /> {texts.fxRainbow}
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step3}</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className={`glass-button ${layoutType === 'clean' ? 'primary' : ''}`} onClick={() => setLayoutType('clean')}>{texts.layoutClean}</button>
                  <button className={`glass-button ${layoutType === 'mini-cover' ? 'primary' : ''}`} onClick={() => setLayoutType('mini-cover')}>{texts.layoutMiniCover}</button>
                  <button className={`glass-button ${layoutType === 'title' ? 'primary' : ''}`} onClick={() => setLayoutType('title')}>{texts.layoutTitle}</button>
                </div>
              </div>
              
              {/* Optional Configs depending on Layout */}
              {(layoutType === 'mini-cover' || (layoutType === 'clean' && ['circle', 'wave-circle', 'pulse'].includes(selectedStyle))) && (
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.addCover}</h5>
                    <ImageUploader onImageAdded={(img) => setAlbumCover(img)} />
                    {albumCover && <span style={{ color: 'var(--success)', marginLeft: '1rem', fontSize: '0.9rem' }}>✓ {texts.coverSelected}</span>}
                  </div>
                  
                  {layoutType === 'mini-cover' && (
                    <div>
                      <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.alignment}</h5>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" name="coverPos" checked={coverPosition === 'left'} onChange={() => setCoverPosition('left')} /> {texts.left}
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" name="coverPos" checked={coverPosition === 'right'} onChange={() => setCoverPosition('right')} /> {texts.right}
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.imageShape}</h5>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="imgShape" checked={imageShape === 'square'} onChange={() => setImageShape('square')} /> {texts.square}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="imgShape" checked={imageShape === 'rounded'} onChange={() => setImageShape('rounded')} /> {texts.rounded}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="imgShape" checked={imageShape === 'circle'} onChange={() => setImageShape('circle')} /> {texts.circle}
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step4}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', flex: 1 }}>
                    <input 
                      type="color" 
                      value={customHexColor} 
                      onChange={(e) => setCustomHexColor(e.target.value)} 
                      style={{
                        width: '50px',
                        height: '50px',
                        padding: '0',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{texts.primaryHue}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{texts.hueDesc}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{texts.step5}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', flex: 1, justifyContent: 'center' }}>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={showTitle} 
                        onChange={(e) => setShowTitle(e.target.checked)} 
                      />
                      {texts.showTitle}
                    </label>

                    {showTitle && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          value={titleFont} 
                          onChange={(e) => setTitleFont(e.target.value)}
                          className="glass-button"
                          style={{ textAlign: 'left', padding: '0.5rem', fontFamily: titleFont, flex: 1 }}
                        >
                          <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                          <option value="Outfit" style={{ fontFamily: 'Outfit' }}>Outfit</option>
                          <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
                          <option value="Space Grotesk" style={{ fontFamily: 'Space Grotesk' }}>Space Grotesk</option>
                          <option value="Oswald" style={{ fontFamily: 'Oswald' }}>Oswald</option>
                          <option value="Playfair Display" style={{ fontFamily: 'Playfair Display' }}>Playfair Display</option>
                          <option value="Bebas Neue" style={{ fontFamily: 'Bebas Neue' }}>Bebas Neue</option>
                          <option value="Righteous" style={{ fontFamily: 'Righteous' }}>Righteous</option>
                          <option value="Cinzel" style={{ fontFamily: 'Cinzel' }}>Cinzel</option>
                          <option value="Orbitron" style={{ fontFamily: 'Orbitron' }}>Orbitron</option>
                          <option value="Press Start 2P" style={{ fontFamily: 'Press Start 2P' }}>Press Start 2P</option>
                          <option value="Audiowide" style={{ fontFamily: 'Audiowide' }}>Audiowide</option>
                          <option value="Teko" style={{ fontFamily: 'Teko' }}>Teko</option>
                          <option value="Syne" style={{ fontFamily: 'Syne' }}>Syne</option>
                          <option value="Permanent Marker" style={{ fontFamily: 'Permanent Marker' }}>Permanent Marker</option>
                          <option value="Impact" style={{ fontFamily: 'Impact' }}>Impact</option>
                          <option value="Arial" style={{ fontFamily: 'Arial' }}>Arial</option>
                        </select>

                        <select
                          value={textStyle}
                          onChange={(e) => setTextStyle(e.target.value)}
                          className="glass-button"
                          style={{ padding: '0.5rem', flex: 1 }}
                        >
                          <option value="solid">{texts.textSolid}</option>
                          <option value="neon">{texts.textNeon}</option>
                          <option value="outline">{texts.textOutline}</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 6: Image Editing */}
              {albumCover && (
                <div>
                  <h3 style={{ marginBottom: '1rem' }}>{texts.step6}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgSize}: {Math.round(imgSize * 100)}%</label>
                      <input type="range" min="0.2" max="3" step="0.05" value={imgSize} onChange={e => setImgSize(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgRotation}: {imgRotation}°</label>
                      <input type="range" min="-180" max="180" step="1" value={imgRotation} onChange={e => setImgRotation(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgOffsetX}: {imgOffsetX}px</label>
                      <input type="range" min="-500" max="500" step="5" value={imgOffsetX} onChange={e => setImgOffsetX(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgOffsetY}: {imgOffsetY}px</label>
                      <input type="range" min="-500" max="500" step="5" value={imgOffsetY} onChange={e => setImgOffsetY(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgBlur}: {imgBlur}px</label>
                      <input type="range" min="0" max="30" step="1" value={imgBlur} onChange={e => setImgBlur(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgBorderWidth}: {imgBorderWidth}px</label>
                      <input type="range" min="0" max="20" step="1" value={imgBorderWidth} onChange={e => setImgBorderWidth(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{texts.imgBorderColor}</label>
                      <input type="color" value={imgBorderColor} onChange={e => setImgBorderColor(e.target.value)} style={{ width: '40px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  className="glass-button" 
                  onClick={() => startBatchExport('webm')}
                  disabled={isBatchExporting}
                >
                  {isBatchExporting ? '...' : `⬇️ BATCH: ${texts.instant}`}
                </button>
                <button 
                  className="glass-button primary" 
                  onClick={() => startBatchExport('mp4')}
                  disabled={isBatchExporting}
                >
                  {isBatchExporting ? 'BATCH EXPORTING (PLEASE WAIT)...' : `⬇️ BATCH: ${texts.mp4}`}
                </button>
              </div>

            </div>

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
                  titleFont={titleFont}
                  imageShape={imageShape}
                  amplitude={amplitude}
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

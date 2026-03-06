import { useState } from 'react';
import Uploader from './components/Uploader';
import VisualizerPreview from './components/VisualizerPreview';
import ImageUploader from './components/ImageUploader';
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

  const removeTrack = (indexToRemove) => {
    setAudioFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Music Visualizer</h1>
        <p>Upload your tracks, select a stunning spectrum, and export to MP4.</p>
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
                  1. Global Configuration (Applies to all tracks)
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className={`glass-button ${selectedStyle === 'bars' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars')}>Bars (Up)</button>
                  <button className={`glass-button ${selectedStyle === 'bars-down' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars-down')}>Bars (Down)</button>
                  <button className={`glass-button ${selectedStyle === 'bars-sym' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars-sym')}>Bars (Sym)</button>
                  <button className={`glass-button ${selectedStyle === 'bars-blocks' ? 'primary' : ''}`} onClick={() => setSelectedStyle('bars-blocks')}>Segmented Bars</button>
                  <button className={`glass-button ${selectedStyle === 'particles' ? 'primary' : ''}`} onClick={() => setSelectedStyle('particles')}>Particles</button>
                  
                  <button className={`glass-button ${selectedStyle === 'wave' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave')}>Wave (Fill)</button>
                  <button className={`glass-button ${selectedStyle === 'wave-line' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave-line')}>Wave (Line)</button>
                  <button className={`glass-button ${selectedStyle === 'wave-sym' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave-sym')}>Wave (Sym)</button>
                  
                  <button className={`glass-button ${selectedStyle === 'circle' ? 'primary' : ''}`} onClick={() => setSelectedStyle('circle')}>Circle</button>
                  <button className={`glass-button ${selectedStyle === 'wave-circle' ? 'primary' : ''}`} onClick={() => setSelectedStyle('wave-circle')}>Wave Circle</button>
                  <button className={`glass-button ${selectedStyle === 'pulse' ? 'primary' : ''}`} onClick={() => setSelectedStyle('pulse')}>Pulse (Bass)</button>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>2. Special FX (Stackable)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.glow} onChange={() => toggleFX('glow')} /> Neon Glow
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.aberration} onChange={() => toggleFX('aberration')} /> RGB Split
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.vhs} onChange={() => toggleFX('vhs')} /> VHS Glitch
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.mirror} onChange={() => toggleFX('mirror')} /> Mirror Floor
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.embers} onChange={() => toggleFX('embers')} /> Embers
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.pixelate} onChange={() => toggleFX('pixelate')} /> Pixelate 8-Bit
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.shake} onChange={() => toggleFX('shake')} /> Bass Shake
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.flash} onChange={() => toggleFX('flash')} /> Flash Bang
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                    <input type="checkbox" checked={activeFX.rainbow} onChange={() => toggleFX('rainbow')} /> Rainbow Hue
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>3. Composition Layout (CapCut Ready)</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className={`glass-button ${layoutType === 'clean' ? 'primary' : ''}`} onClick={() => setLayoutType('clean')}>Clean (Centered)</button>
                  <button className={`glass-button ${layoutType === 'mini-cover' ? 'primary' : ''}`} onClick={() => setLayoutType('mini-cover')}>Mini Cover Mode</button>
                  <button className={`glass-button ${layoutType === 'title' ? 'primary' : ''}`} onClick={() => setLayoutType('title')}>Title Mode</button>
                </div>
              </div>
              
              {/* Optional Configs depending on Layout */}
              {(layoutType === 'mini-cover' || (layoutType === 'clean' && ['circle', 'wave-circle', 'pulse'].includes(selectedStyle))) && (
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Album Cover Image</h5>
                    <ImageUploader onImageAdded={(img) => setAlbumCover(img)} />
                    {albumCover && <span style={{ color: 'var(--success)', marginLeft: '1rem', fontSize: '0.9rem' }}>✓ Image loaded</span>}
                  </div>
                  
                  {layoutType === 'mini-cover' && (
                    <div>
                      <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Alignment</h5>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" name="coverPos" checked={coverPosition === 'left'} onChange={() => setCoverPosition('left')} /> Left
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" name="coverPos" checked={coverPosition === 'right'} onChange={() => setCoverPosition('right')} /> Right
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Image Shape</h5>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="imgShape" checked={imageShape === 'square'} onChange={() => setImageShape('square')} /> Square
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="imgShape" checked={imageShape === 'rounded'} onChange={() => setImageShape('rounded')} /> Rounded
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="imgShape" checked={imageShape === 'circle'} onChange={() => setImageShape('circle')} /> Circle
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>4. Custom Color</h4>
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>Primary Hue</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Affects gradients, neon glow, and particles</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>5. Title Font</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', flex: 1, justifyContent: 'center' }}>
                    <select 
                      value={titleFont} 
                      onChange={(e) => setTitleFont(e.target.value)}
                      className="glass-button"
                      style={{ textAlign: 'left', padding: '0.5rem', fontFamily: titleFont }}
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
                  </div>
                </div>
              </div>
              
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {audioFiles.map((file, index) => (
                <VisualizerPreview 
                  key={`${file.name}-${index}`} 
                  file={file} 
                  styleType={selectedStyle}
                  layoutType={layoutType}
                  albumCover={albumCover}
                  activeFX={activeFX}
                  coverPosition={coverPosition}
                  customHexColor={customHexColor}
                  titleFont={titleFont}
                  imageShape={imageShape}
                  onRemove={() => removeTrack(index)}
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

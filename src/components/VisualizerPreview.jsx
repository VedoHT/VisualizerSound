
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { setupAudioContext, drawVisualizer } from '../utils/audioVisualizer';
import { createRecorder, convertWebmToMp4, downloadBlob } from '../services/exportService';

const VisualizerPreview = forwardRef(({ file, styleType, layoutType, albumCover, activeFX, coverPosition, customHexColor, titleFont, imageShape, amplitude, showTitle, textStyle, onRemove, texts }, ref) => {
  const canvasWrapRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [songTitle, setSongTitle] = useState(file.name.replace(/\.[^/.]+$/, ''));
  
  // Timeline State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animationRef = useRef(null);
  const isPlayingRef = useRef(false); // Prevents overlapping frames
  
  const configRef = useRef({});

  // V10: Sync properties to ref to evade outdated closures, and auto-draw 1 frame if paused
  useEffect(() => {
    configRef.current = {
      style: styleType,
      layout: layoutType,
      albumImg: albumCover,
      songTitle: songTitle,
      activeFX: activeFX,
      coverPosition: coverPosition,
      customHexColor: customHexColor,
      titleFont: titleFont,
      imageShape: imageShape,
      amplitude: amplitude,
      showTitle: showTitle,
      textStyle: textStyle
    };
    if (!isPlayingRef.current) {
      draw(true); // Redraws screen live when user checks a box or changes color while paused
    }
  }, [styleType, layoutType, albumCover, songTitle, activeFX, coverPosition, customHexColor, titleFont, imageShape, amplitude, showTitle, textStyle]);
  
  // Recorder refs
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (audioRef.current && file) {
      audioRef.current.src = URL.createObjectURL(file);
    }
    return () => {
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [file]);
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    // Draw one frame even if paused
    if (!isPlaying) draw(true);
  };

  const initAudio = () => {
    if (!audioCtxRef.current && canvasRef.current && audioRef.current) {
      const { audioContext, analyser, dataArray, source } = setupAudioContext(audioRef.current);
      audioCtxRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceNodeRef.current = source;
    }
  };

  const draw = (singleFrame = false) => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    // Safety check - avoid dual loops
    if (!singleFrame && !isPlayingRef.current) return;

    drawVisualizer(canvasRef.current, analyserRef.current, dataArrayRef.current, configRef.current);
    if (!singleFrame) {
      animationRef.current = requestAnimationFrame(() => draw(false));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    initAudio();

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };
  
  const toggleFullscreen = () => {
    if (!canvasWrapRef.current) return;
    if (!document.fullscreenElement) {
      canvasWrapRef.current.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleExport = async (format = 'mp4') => {
    return new Promise((resolve, reject) => {
      if (isExporting || !audioRef.current || !canvasRef.current) {
        resolve();
        return;
      }
      
      setIsExporting(true);
      setExportProgress(texts?.initializing || 'Initializing audio...');
      initAudio();
      
      // V7: Silent Export
      audioRef.current.muted = true;
      
      if (isPlaying) {
        audioRef.current.pause();
        isPlayingRef.current = false;
        cancelAnimationFrame(animationRef.current);
        setIsPlaying(false);
      }
      
      audioRef.current.currentTime = 0;
      
      try {
        setExportProgress(texts?.recording || 'Recording visualizer...');
      const { recorder, chunks } = createRecorder(canvasRef.current, audioCtxRef.current, sourceNodeRef.current);
      recorderRef.current = recorder;
      chunksRef.current = chunks;
      
      recorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        
          if (format === 'webm') {
            downloadBlob(webmBlob, `${songTitle}_${styleType}.webm`);
            setExportProgress('');
            setIsExporting(false);
            chunksRef.current = [];
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }
            resolve();
            return;
          }

        setExportProgress('Encoding MP4 (0%)...');
        
        try {
          const mp4Blob = await convertWebmToMp4(
            webmBlob, 
            `visualizer_${styleType}_${layoutType}`,
            (percent) => setExportProgress(`Encoding MP4 (${percent}%)...`)
          );
          downloadBlob(mp4Blob, `${songTitle}_${styleType}.mp4`);
          setExportProgress('');
          } catch (err) {
            console.error('Error during conversion', err);
            setExportProgress('Export failed! See console.');
            reject(err);
          } finally {
            setIsExporting(false);
            chunksRef.current = [];
            
            // Re-enable sound
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }
            resolve();
          }
        };

      recorder.start();
      
      audioRef.current.play();
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
        isPlayingRef.current = true;
        draw();
        
      } catch (err) {
        console.error(err);
        setExportProgress('Error starting recorder.');
        setIsExporting(false);
        audioRef.current.muted = false;
        reject(err);
      }
    });
  };

  useImperativeHandle(ref, () => ({
    exportWebM: () => handleExport('webm'),
    exportMP4: () => handleExport('mp4')
  }));

  const formatTime = (timeInSeconds) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Song Title Overlay</label>
          <input 
            type="text" 
            value={songTitle} 
            onChange={(e) => setSongTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="glass-button" 
            onClick={onRemove}
            style={{ padding: '8px 12px', color: '#ff6b6b' }}
            title="Remove Track"
          >
            ✖ Excluir
          </button>
          <button 
            className="glass-button" 
            onClick={toggleFullscreen}
            style={{ padding: '8px 12px' }}
          >
            ⛶ Fullscreen
          </button>
          <button 
            className="glass-button" 
            onClick={togglePlay}
            disabled={isExporting}
            style={{ padding: '8px 16px', minWidth: '90px' }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Seeking / Timeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>{formatTime(currentTime)}</span>
        <input 
          type="range" 
          min="0" 
          max={duration || 100} 
          value={currentTime} 
          onChange={handleSeek}
          disabled={isExporting}
          style={{ flex: 1, accentColor: 'var(--primary)' }}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div 
        ref={canvasWrapRef}
        style={{
          width: '100%',
          aspectRatio: '16/9',
          background: '#000000',
          borderRadius: document.fullscreenElement ? '0' : '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <canvas 
          ref={canvasRef} 
          width={1920} 
          height={1080} 
          style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }}
        />
        {!isPlaying && !audioCtxRef.current && !isExporting && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            background: 'rgba(0,0,0,0.7)',
            padding: '1rem 2rem',
            borderRadius: '8px'
          }}>
            {texts?.pressPlay || 'Press Play to preview visualizer'}
          </div>
        )}

        {/* Loading Overlay */}
        {isExporting && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', textShadow: '0 0 20px var(--primary)' }}>
              {texts?.exporting || 'SILENT EXPORT IN PROGRESS...'}
            </h2>
            <div style={{ 
              width: '60%', 
              height: '8px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                height: '100%',
                width: `${exportProgress.includes('Encoding') ? parseInt(exportProgress.replace(/\D/g, '')) || 0 : (currentTime / duration) * 100}%`,
                background: 'var(--primary)',
                transition: 'width 0.2s linear'
              }} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              {exportProgress.includes('Encoding') 
                ? exportProgress 
                : `${texts?.frame || 'Rendering Frame'} ${formatTime(currentTime)} / ${formatTime(duration)}`}
            </p>
          </div>
        )}
      </div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          // V10 Fix: Force all other canvases to halt and mute when another song is played
          document.querySelectorAll('audio').forEach(el => {
            if (el !== audioRef.current && !el.paused) el.pause();
          });
          
          setIsPlaying(true);
          if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          }
          if (!isPlayingRef.current) {
            isPlayingRef.current = true;
            draw();
          }
        }}
        onPause={() => {
          // CRITICAL: Do NOT kill the draw loop if we are mid-export.
          // The recorder needs frames to keep flowing until onEnded fires.
          if (isExporting) return;
          
          setIsPlaying(false);
          isPlayingRef.current = false;
          cancelAnimationFrame(animationRef.current);
        }}
        onEnded={() => {
          setIsPlaying(false);
          isPlayingRef.current = false;
          cancelAnimationFrame(animationRef.current);
          if (isExporting && recorderRef.current?.state === 'recording') {
            recorderRef.current.stop();
          }
        }} 
        style={{ display: 'none' }} 
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          {/* Progress moved to overlay, but keep text status active here so it doesn't break layout */}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="glass-button" 
            onClick={() => handleExport('webm')}
            disabled={isExporting}
            style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)' }}
            title="Saves instantly, no FFmpeg CPU encoding needed. CapCut supports WebM."
          >
            {isExporting ? '...' : (texts?.instant || 'Download WebM (Instant)')}
          </button>
          <button 
            className="glass-button primary" 
            onClick={() => handleExport('mp4')}
            disabled={isExporting}
            title="Encodes native H264 MP4 using WASM. Takes extra time."
          >
            {isExporting ? '...' : (texts?.mp4 || 'Export 1080p MP4 (Slower)')}
          </button>
        </div>
      </div>
    </div>
  );
});

export default VisualizerPreview;

import { useRef, useState } from 'react';

export default function Uploader({ onAudioAdded, onImageAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFiles = (files) => {
    const audioFiles = [];
    let imageFile = null;

    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('audio/')) {
        audioFiles.push(files[i]);
      } else if (files[i].type.startsWith('image/')) {
        imageFile = files[i];
      }
    }

    if (audioFiles.length > 0) onAudioAdded(audioFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-color)'}`,
        borderRadius: '12px',
        padding: '3rem 2rem',
        textAlign: 'center',
        transition: 'var(--transition)',
        backgroundColor: isDragging ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
        cursor: 'pointer'
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        multiple 
        accept="audio/*,image/*"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }} 
      />
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: isDragging ? 'var(--primary)' : 'var(--text-primary)' }}>
        {isDragging ? 'Drop assets here!' : 'Add Audio and Cover Images'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Supports Audio (.mp3, .wav) and Images (.jpg, .png) for Album Covers
      </p>
      <button 
        className="glass-button primary" 
        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
      >
        Browse Files
      </button>
    </div>
  );
}

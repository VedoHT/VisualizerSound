import { useRef } from 'react';

export default function ImageUploader({ onImageAdded }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => onImageAdded(img);
        img.src = url;
      }
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <input 
        type="file" 
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }} 
      />
      <button 
        className="glass-button" 
        onClick={() => fileInputRef.current?.click()}
        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
      >
        Upload Image
      </button>
    </div>
  );
}

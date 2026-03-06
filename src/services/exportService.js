import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

export const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  
  // NOTE: Loading ffmpeg core requires setting up COOP and COEP headers on the server
  // Or using a workaround. For Vite dev server, we can configure vite headers if needed.
  await ffmpeg.load();
  return ffmpeg;
};

export const createRecorder = (canvas, audioContext, sourceNode) => {
  // Capture 30fps video from Canvas (doubles encoding speed vs 60fps)
  const canvasStream = canvas.captureStream(30);
  
  // V7: Video Only. Ignore Audio context destination completely.
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks()
  ]);

  const chunks = [];
  const options = { mimeType: 'video/webm; codecs=vp8' };
  
  // Fallback to simpler mimeType if previous is not supported
  const finalMimeType = MediaRecorder.isTypeSupported(options.mimeType) 
    ? options.mimeType 
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, { mimeType: finalMimeType });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return { recorder, chunks };
};

export const convertWebmToMp4 = async (webmBlob, fileName = 'visualizer', onProgress = null) => {
  const fm = await initFFmpeg();
  
  if (onProgress) {
    fm.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }
  
  const inputName = 'input.webm';
  const outputName = `${fileName}.mp4`;

  await fm.writeFile(inputName, await fetchFile(webmBlob));

  // Execute FFmpeg command to convert
  // V7: Using ultrafast preset and -an (No Audio) for a silent .mp4
  await fm.exec([
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-an',
    outputName
  ]);

  const outputData = await fm.readFile(outputName);
  const mp4Blob = new Blob([outputData.buffer], { type: 'video/mp4' });
  
  return mp4Blob;
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

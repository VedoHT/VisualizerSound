import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

export const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  await ffmpeg.load();
  return ffmpeg;
};

export const createRecorder = (canvas, audioContext, sourceNode) => {
  // Capture 30fps video from Canvas
  const canvasStream = canvas.captureStream(30);
  
  // V13: Include Audio! Route audio through a MediaStreamDestination
  const audioDest = audioContext.createMediaStreamDestination();
  sourceNode.connect(audioDest);
  
  // Combine video + audio tracks
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks()
  ]);

  const chunks = [];
  
  // Try vp8 + opus for best compatibility
  const candidates = [
    'video/webm; codecs=vp8,opus',
    'video/webm; codecs=vp8',
    'video/webm'
  ];
  let finalMimeType = 'video/webm';
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      finalMimeType = mime;
      break;
    }
  }

  const recorder = new MediaRecorder(combinedStream, { 
    mimeType: finalMimeType,
    videoBitsPerSecond: 6000000, // 6Mbps - Sharp but not unconstrained
    audioBitsPerSecond: 192000    // 192Kbps
  });

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

  // V15: Ultimate Compatibility Fix for CapCut & NLEs
  // Hard-locking Baseline profile and disabling B-frames (-bf 0) 
  // This makes the file significantly "lighter" for editors to scroll through.
  await fm.exec([
    '-i', inputName,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-profile:v', 'baseline',
    '-level', '3.0',
    '-tune', 'fastdecode',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-g', '30',
    '-keyint_min', '30',
    '-sc_threshold', '0',
    '-bf', '0',
    '-b:v', '5000k',
    '-maxrate', '5000k',
    '-bufsize', '10000k',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
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

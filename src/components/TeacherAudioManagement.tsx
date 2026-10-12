import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { soundEngine, AUDIO_CONFIGS, AudioItemConfig } from '../utils/audio';

export const TeacherAudioManagement: React.FC = () => {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, setRefreshState] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Subscribe to changes in soundEngine recordings
  useEffect(() => {
    const unsub = soundEngine.subscribe(() => {
      setRefreshState((prev) => prev + 1);
    });
    return unsub;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Play sample
  const handlePlaySample = async (key: string) => {
    if (playingKey) return;
    setPlayingKey(key);
    try {
      await soundEngine.playSample(key);
    } catch (e) {
      console.warn('Playback error:', e);
    } finally {
      setPlayingKey(null);
    }
  };

  // Start mic recording
  const handleStartRecording = async (key: string) => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Trình duyệt chưa hỗ trợ ghi âm trực tiếp hoặc chưa cấp quyền.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        await soundEngine.saveTeacherRecording(key, audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setRecordingKey(null);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setRecordingKey(key);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
      setErrorMsg('Không thể mở micro. Vui lòng cho phép quyền truy cập micro trong trình duyệt.');
      setRecordingKey(null);
    }
  };

  // Stop mic recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Upload file
  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await soundEngine.saveTeacherRecording(key, file);
      e.target.value = '';
    } catch (err) {
      console.error('File upload save error:', err);
      setErrorMsg('Không thể lưu file âm thanh.');
    }
  };

  // Delete teacher recording
  const handleDeleteCustom = async (key: string) => {
    await soundEngine.deleteTeacherRecording(key);
  };

  const partConfigs = AUDIO_CONFIGS.filter((c) => c.category === 'part');
  const specialConfigs = AUDIO_CONFIGS.filter((c) => c.category === 'special');

  const renderAudioRow = (config: AudioItemConfig) => {
    const isCustom = soundEngine.hasCustomRecording(config.key);
    const isCurrentlyRecording = recordingKey === config.key;
    const isCurrentlyPlaying = playingKey === config.key;

    return (
      <div
        key={config.key}
        className={`p-2.5 rounded-2xl border transition-all ${
          isCurrentlyRecording
            ? 'bg-red-50 border-red-400 ring-2 ring-red-300'
            : isCustom
            ? 'bg-emerald-50/70 border-emerald-300'
            : 'bg-white border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-amber-950">
              {config.label}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              “{config.speechText}”
            </span>
          </div>

          <div>
            {isCustom ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Giọng cô giáo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                <Volume2 className="w-3 h-3 text-amber-600" />
                Giọng mặc định
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-amber-100">
          {/* Play Sample Button */}
          <button
            onClick={() => handlePlaySample(config.key)}
            disabled={isCurrentlyPlaying || isCurrentlyRecording}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isCurrentlyPlaying
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
            }`}
            title="Nghe thử âm thanh"
          >
            <Play className={`w-3.5 h-3.5 ${isCurrentlyPlaying ? 'fill-white' : ''}`} />
            <span>{isCurrentlyPlaying ? 'Đang đọc...' : 'Nghe thử'}</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Record / Stop Button */}
            {isCurrentlyRecording ? (
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white animate-pulse cursor-pointer shadow-xs"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Dừng ({recordingSeconds}s)</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartRecording(config.key)}
                disabled={recordingKey !== null}
                className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-900 cursor-pointer transition-all"
                title="Ghi âm giọng của giáo viên bằng micro"
              >
                <Mic className="w-3.5 h-3.5 text-rose-600" />
                <span>Ghi âm</span>
              </button>
            )}

            {/* Upload MP3/WAV/M4A Button */}
            <input
              type="file"
              accept=".mp3,.wav,.m4a,audio/*"
              className="hidden"
              ref={(el) => {
                fileInputRefs.current[config.key] = el;
              }}
              onChange={(e) => handleFileUpload(config.key, e)}
            />
            <button
              onClick={() => fileInputRefs.current[config.key]?.click()}
              disabled={recordingKey !== null}
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 cursor-pointer transition-all"
              title="Tải lên tệp âm thanh (MP3, WAV, M4A)"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tải file</span>
            </button>

            {/* Delete / Revert Button (Only if custom exists) */}
            {isCustom && (
              <button
                onClick={() => handleDeleteCustom(config.key)}
                disabled={recordingKey !== null}
                className="p-1 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Xóa bản ghi này và quay về giọng đọc mặc định"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-600" />
            Quản Lý Âm Thanh & Giọng Đọc
          </h3>
          <p className="text-[11px] text-amber-800">
            Cô giáo có thể ghi âm trực tiếp hoặc tải file MP3 để phát đúng giọng cô dạy trên lớp
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2 text-xs text-red-700 bg-red-100 border border-red-300 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* 6 Bộ phận khuôn mặt */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
          1. Giọng đọc 6 bộ phận khuôn mặt:
        </span>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {partConfigs.map(renderAudioRow)}
        </div>
      </div>

      {/* Lời nói đặc biệt */}
      <div className="space-y-2 pt-1 border-t border-amber-200">
        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          2. Giọng giới thiệu & Chúc mừng hoàn thành:
        </span>
        <div className="space-y-1.5">
          {specialConfigs.map(renderAudioRow)}
        </div>
      </div>
    </div>
  );
};

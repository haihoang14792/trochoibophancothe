import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Settings,
  Tv,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  History,
  Mic,
} from 'lucide-react';
import { CharacterType, GameLevel } from '../types';
import { useFirebase } from '../context/FirebaseContext';
import { TeacherAudioManagement } from './TeacherAudioManagement';

export interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterType;
  onChangeCharacter: (char: CharacterType) => void;
  level: GameLevel;
  onChangeLevel: (lvl: GameLevel) => void;
  isSfxEnabled: boolean;
  onToggleSfx: () => void;
  onRestart: () => void;
}

const FirebaseTeacherSection: React.FC = () => {
  const { user, isLoading, login, logout, gameHistory } = useFirebase();
  const [showHistory, setShowHistory] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      await login();
    } catch (err: any) {
      setAuthError(err?.message || 'Đăng nhập không thành công');
    }
  };

  return (
    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-amber-600" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-950 block">
              Kết nối Cloud Firebase
            </span>
            <span className="text-[11px] text-amber-800">
              {user ? `Đã kết nối: ${user.displayName || user.email}` : 'Lưu trữ phiên chơi & lịch sử lớp học'}
            </span>
          </div>
        </div>

        {user ? (
          <button
            onClick={() => logout()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-xl cursor-pointer transition-all"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Thoát</span>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>

      {authError && (
        <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {authError}
        </div>
      )}

      {user && (
        <div className="pt-1 border-t border-amber-200/60">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã đồng bộ Firestore ({gameHistory.length} lượt chơi)
            </span>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <History className="w-3 h-3" />
              {showHistory ? 'Ẩn' : 'Xem lịch sử'}
            </button>
          </div>

          {showHistory && (
            <div className="mt-2 max-h-32 overflow-y-auto space-y-1 pr-1 text-[11px]">
              {gameHistory.length === 0 ? (
                <div className="text-slate-500 italic py-1 text-center">Chưa có lượt chơi nào được lưu.</div>
              ) : (
                gameHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-1.5 bg-white/80 rounded-lg flex items-center justify-between border border-amber-100"
                  >
                    <span>
                      {item.character === 'boy' ? '👦' : '👧'} Mức {item.level === 1 ? 'Dễ' : 'Nâng cao'} · {item.durationSeconds}s
                    </span>
                    <span className="text-emerald-700 font-semibold">✓ Đạt</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  character,
  onChangeCharacter,
  level,
  onChangeLevel,
  isSfxEnabled,
  onToggleSfx,
  onRestart,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'audio'>('settings');

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative max-w-lg w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-300 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Settings className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-950">
                Bảng Điều Khiển Giáo Viên
              </h2>
              <p className="text-xs text-amber-700 font-semibold">
                Tùy chỉnh bài học & ghi âm giọng cô giáo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-amber-100/70 rounded-2xl">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Bài Dạy & Lớp Học</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span>Quản Lý Âm Thanh</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {activeTab === 'settings' ? (
            <>
              {/* 1. Mức độ bài học */}
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                  Mức độ thử thách:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeLevel(1)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      level === 1
                        ? 'bg-amber-100 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-amber-950 text-sm">
                      Mức Dễ (4 hình)
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Cặp mắt, mũi, miệng, cặp tai (Cho bé 24-36 tháng)
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeLevel(2)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      level === 2
                        ? 'bg-amber-100 border-amber-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold text-amber-950 text-sm">
                      Mức Nâng Cao (6 hình)
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Ghép riêng mắt trái/phải, tai trái/phải, mũi, miệng
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Chọn nhân vật */}
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                  Nhân vật bé minh họa:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeCharacter('boy')}
                    className={`p-2.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                      character === 'boy'
                        ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">👦</span>
                    <span>Bé Trai</span>
                  </button>

                  <button
                    onClick={() => onChangeCharacter('girl')}
                    className={`p-2.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer ${
                      character === 'girl'
                        ? 'bg-rose-100 border-rose-500 text-rose-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">👧</span>
                    <span>Bé Gái</span>
                  </button>
                </div>
              </div>

              {/* 3. Hiệu ứng âm thanh */}
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                  Hiệu ứng âm thanh:
                </label>
                <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <div className="flex items-center gap-2">
                    {isSfxEnabled ? (
                      <Volume2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-amber-950">
                      Âm thanh Tích / Boing / Giọng đọc / Nhạc mừng
                    </span>
                  </div>
                  <button
                    onClick={onToggleSfx}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSfxEnabled
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {isSfxEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                  </button>
                </div>
              </div>

              {/* 4. Kết nối Firebase & Đồng bộ dữ liệu */}
              <FirebaseTeacherSection />

              {/* 5. Thao tác giảng dạy nhanh */}
              <div className="pt-1 flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Tv className="w-4 h-4 text-indigo-700" />
                  <span>Toàn Màn Hình Tivi</span>
                </button>

                <button
                  onClick={() => {
                    onRestart();
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi Lại Ngay</span>
                </button>
              </div>
            </>
          ) : (
            <TeacherAudioManagement />
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          XÁC NHẬN & QUAY LẠI TRÒ CHƠI
        </button>
      </div>
    </div>
  );
};

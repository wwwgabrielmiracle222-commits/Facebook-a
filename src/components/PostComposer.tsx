import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  Smile,
  MapPin,
  X,
  BarChart2,
  Plus,
  Trash2,
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  RotateCcw,
  Check,
  Video,
  Square,
  Circle,
  Play,
  Film,
} from 'lucide-react';
import { Post, User, Poll } from '../types';

interface PostComposerProps {
  currentUser: User;
  onAddPost: (newPost: Post) => void;
  darkMode: boolean;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  currentUser,
  onAddPost,
  darkMode,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isCameraPhoto, setIsCameraPhoto] = useState(false);
  const [isCameraVideo, setIsCameraVideo] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');

  // Poll state
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Camera Mode: 'photo' vs 'video'
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('video');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'none' | 'warm' | 'vintage' | 'mono' | 'vibrant'>('none');

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const MAX_RECORDING_SECONDS = 30; // Short clip up to 30 seconds
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play mechanical shutter click audio
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // First click (mirror flap)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(820, now);
      osc1.frequency.exponentialRampToValueAtTime(100, now + 0.04);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.04);

      // Second click (shutter release curtain)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(620, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(70, now + 0.11);
      gain2.gain.setValueAtTime(0.3, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.12);
    } catch {
      // Audio context restricted or unavailable
    }
  };

  // Play recording beep
  const playRecordingBeep = (isStart: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isStart ? 880 : 440, now);
      if (isStart) {
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      } else {
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
      }
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (isStart ? 0.14 : 0.18));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (isStart ? 0.15 : 0.19));
    } catch {
      // Audio context restricted
    }
  };

  // Safe camera stream starter
  const startCamera = async (mode: 'user' | 'environment' = cameraFacingMode) => {
    setCameraError(null);
    setIsCameraActive(true);

    // Stop existing tracks if switching modes
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or platform.');
      }

      let stream: MediaStream;
      // Request audio as well if recording video is preferred, but gracefully handle audio failure
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback to simple video constraint
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log('Autoplay warning:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      const isPermissionDenied =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(
        isPermissionDenied
          ? 'Camera permission denied. Please allow camera access in your browser settings or attach a media file.'
          : 'Unable to access camera device. You can record with your device camera or attach a sample video.'
      );
    }
  };

  const stopCamera = () => {
    if (isRecording) {
      stopRecordingVideo();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Attach active stream to video element when mounted or facing mode updates
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch((e) => console.log('Autoplay warning:', e));
    }
  }, [isCameraActive, cameraFacingMode]);

  // Clean up camera hardware tracks on unmount
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Format recording timer seconds (mm:ss)
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Video Recording Logic using MediaRecorder API
  const startRecordingVideo = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    const stream = mediaStreamRef.current;
    let options: MediaRecorderOptions = {};

    // Select supported mimeType
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        options = { mimeType: 'video/webm;codecs=vp9,opus' };
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        options = { mimeType: 'video/webm' };
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' };
      }
    }

    try {
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const recordedUrl = URL.createObjectURL(blob);
        setVideoUrl(recordedUrl);
        setIsCameraVideo(true);
        // Clear any image so video takes precedence
        setImageUrl('');
        setIsCameraPhoto(false);
        stopCamera();
      };

      recorder.start(250); // Collect slice every 250ms
      setIsRecording(true);
      playRecordingBeep(true);

      // Start elapsed timer
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            stopRecordingVideo();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.error('Failed to initialize MediaRecorder:', e);
      // Fallback: simulate clip recording for mock or unsupported environments
      setIsRecording(true);
      playRecordingBeep(true);
      let count = 0;
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = setInterval(() => {
        count += 1;
        setRecordingSeconds(count);
        if (count >= 5) {
          // Auto complete fallback
          if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
          setIsRecording(false);
          useSampleCameraVideo();
        }
      }, 1000);
    }
  };

  const stopRecordingVideo = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    playRecordingBeep(false);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping MediaRecorder:', e);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    playShutterSound();
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 160);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Mirror image horizontally if user is using selfie/front camera
      if (cameraFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Apply selected filter to canvas if requested
      if (selectedFilter === 'warm') {
        ctx.filter = 'sepia(0.25) saturate(1.3) contrast(1.05)';
      } else if (selectedFilter === 'vintage') {
        ctx.filter = 'sepia(0.5) contrast(1.1) brightness(0.95)';
      } else if (selectedFilter === 'mono') {
        ctx.filter = 'grayscale(1) contrast(1.2)';
      } else if (selectedFilter === 'vibrant') {
        ctx.filter = 'saturate(1.4) contrast(1.1)';
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageUrl(dataUrl);
      setIsCameraPhoto(true);
      setVideoUrl('');
      setIsCameraVideo(false);

      // Stop camera after photo is captured
      stopCamera();
    }
  };

  // Provide fallback sample video clip for testing environments where camera hardware is restricted
  const useSampleCameraVideo = () => {
    playRecordingBeep(true);
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setIsCameraVideo(true);
    setImageUrl('');
    setIsCameraPhoto(false);
    stopCamera();
  };

  // Provide fallback sample camera shot
  const useSampleCameraShot = () => {
    playShutterSound();
    setImageUrl('https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1280');
    setIsCameraPhoto(true);
    setVideoUrl('');
    setIsCameraVideo(false);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isVideo) {
            setVideoUrl(reader.result);
            setIsCameraVideo(false);
            setImageUrl('');
          } else {
            setImageUrl(reader.result);
            setIsCameraPhoto(false);
            setVideoUrl('');
          }
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const feelingsList = [
    '😊 happy',
    '🥳 celebrating',
    '☕ relaxed',
    '💡 inspired',
    '✈️ traveling',
    '🏋️ working out',
    '🎧 listening to music',
    '✨ blessed',
  ];

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const handleResetForm = () => {
    stopCamera();
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setIsCameraPhoto(false);
    setIsCameraVideo(false);
    setSelectedFilter('none');
    setFeeling('');
    setLocation('');
    setIsCreatingPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowModal(false);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPollOptions = pollOptions.filter((o) => o.trim().length > 0);
    const hasValidPoll =
      isCreatingPoll && (pollQuestion.trim() || content.trim()) && validPollOptions.length >= 2;

    if (!content.trim() && !imageUrl.trim() && !videoUrl.trim() && !hasValidPoll) return;

    const pollData: Poll | undefined = hasValidPoll
      ? {
          id: `poll_${Date.now()}`,
          question: pollQuestion.trim() || content.trim() || 'Poll Question',
          options: validPollOptions.map((optText, index) => ({
            id: `opt_${Date.now()}_${index}`,
            text: optText.trim(),
            votes: 0,
            votedUserIds: [],
          })),
          totalVotes: 0,
        }
      : undefined;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: currentUser,
      content: content.trim() || (pollData ? pollData.question : ''),
      imageUrl: imageUrl.trim() || undefined,
      images: imageUrl.trim() ? [imageUrl.trim()] : undefined,
      videoUrl: videoUrl.trim() || undefined,
      isCameraVideo: isCameraVideo || undefined,
      isCameraPhoto: isCameraPhoto || undefined,
      feeling: feeling || undefined,
      location: location.trim() || undefined,
      timestamp: 'Just now',
      reactions: { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      userReaction: null,
      comments: [],
      sharesCount: 0,
      privacy: privacy,
      poll: pollData,
    };

    onAddPost(newPost);
    handleResetForm();
  };

  return (
    <div
      className={`rounded-lg border shadow-xs p-3 transition-colors ${
        darkMode ? 'bg-[#242526] border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Top Input Bar Trigger */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600"
        />
        <div
          onClick={() => setShowModal(true)}
          className={`flex-1 rounded-full px-4 py-2 text-xs sm:text-sm cursor-pointer transition-colors ${
            darkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          What's on your mind, {currentUser.name.split(' ')[0]}?
        </div>
      </div>

      {/* Quick Option Bar */}
      <div className="flex items-center justify-around pt-2 text-xs font-medium flex-wrap gap-1">
        {/* Direct Camera Button */}
        <button
          onClick={() => {
            setCameraMode('video');
            setShowModal(true);
            setTimeout(() => {
              startCamera();
            }, 60);
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
          title="Open camera to record a video clip or take a photo"
        >
          <Camera className="w-4 h-4 text-emerald-500" />
          <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Camera</span>
        </button>

        {/* Direct Video Record Button */}
        <button
          onClick={() => {
            setCameraMode('video');
            setShowModal(true);
            setTimeout(() => {
              startCamera();
            }, 60);
          }}
          className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
          title="Record short video clip"
        >
          <Video className="w-4 h-4 text-rose-500" />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Record Video</span>
        </button>

        <button
          onClick={() => {
            setCameraMode('photo');
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-green-600 dark:text-green-400 transition-colors cursor-pointer"
        >
          <Image className="w-4 h-4 text-green-500" />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Photo</span>
        </button>

        <button
          onClick={() => {
            setIsCreatingPoll(true);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
        >
          <BarChart2 className="w-4 h-4 text-blue-500" />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Poll</span>
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-yellow-600 dark:text-yellow-400 transition-colors cursor-pointer"
        >
          <Smile className="w-4 h-4 text-yellow-500" />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Feeling</span>
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-red-500" />
          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Check in</span>
        </button>
      </div>

      {/* Modal Composer */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-colors max-h-[92vh] flex flex-col ${
              darkMode ? 'bg-[#242526] text-white' : 'bg-white text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="p-3 border-b flex items-center justify-between border-gray-200 dark:border-gray-700 relative shrink-0">
              <h3 className="font-bold text-sm text-center flex-1">Create Post</h3>
              <button
                onClick={handleResetForm}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 absolute right-3 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author Info & Audience Selector */}
            <form onSubmit={handlePostSubmit} className="p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">{currentUser.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value as any)}
                      className={`text-[11px] py-0.5 px-2 rounded border outline-none font-medium cursor-pointer ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-200'
                          : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                    >
                      <option value="public">🌐 Public</option>
                      <option value="friends">👥 Friends</option>
                      <option value="only_me">🔒 Only me</option>
                    </select>

                    {feeling && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        is feeling <span className="font-medium text-slate-800 dark:text-gray-200">{feeling}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Text Input Area */}
              <textarea
                rows={3}
                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full p-3 text-sm rounded-lg border outline-none resize-none ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-gray-500'
                }`}
                autoFocus
              />

              {/* Create Poll Toggle & Form */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <BarChart2 className="w-4 h-4" />
                    <span>Create a Poll</span>
                  </div>
                  {!isCreatingPoll ? (
                    <button
                      type="button"
                      onClick={() => setIsCreatingPoll(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                    >
                      + Add Poll
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPoll(false);
                        setPollQuestion('');
                        setPollOptions(['', '']);
                      }}
                      className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
                    >
                      Remove Poll
                    </button>
                  )}
                </div>

                {isCreatingPoll && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1 text-gray-600 dark:text-gray-300">
                        Poll Question
                      </label>
                      <input
                        type="text"
                        placeholder="Ask a question (e.g., What's your favorite weekend activity?)"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        className={`w-full p-2 text-xs rounded-lg border outline-none ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold block text-gray-600 dark:text-gray-300">
                        Poll Options
                      </label>
                      {pollOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                            className={`flex-1 p-2 text-xs rounded-lg border outline-none ${
                              darkMode
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                : 'bg-white border-gray-300 text-slate-900'
                            }`}
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePollOption(idx)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Remove Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {pollOptions.length < 6 && (
                        <button
                          type="button"
                          onClick={handleAddPollOption}
                          className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline pt-0.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add another option</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo & Live Camera Attachment Section */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-500" />
                    <span>Attach Photo & Camera Video</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Live Camera Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isCameraActive) {
                          stopCamera();
                        } else {
                          startCamera();
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        isCameraActive
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 shadow-2xs'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isCameraActive ? 'Close Camera' : 'Live Camera'}</span>
                    </button>

                    {/* Choose File Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                      capture="environment"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Live Camera Viewfinder */}
                {isCameraActive && (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-4/3 flex flex-col items-center justify-center border-2 border-emerald-500 shadow-xl group">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover transition-transform duration-200 ${
                        cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''
                      }`}
                      style={{
                        filter:
                          selectedFilter === 'warm'
                            ? 'sepia(0.25) saturate(1.3)'
                            : selectedFilter === 'vintage'
                            ? 'sepia(0.45) contrast(1.1)'
                            : selectedFilter === 'mono'
                            ? 'grayscale(1)'
                            : selectedFilter === 'vibrant'
                            ? 'saturate(1.4)'
                            : 'none',
                      }}
                    />

                    {/* Viewfinder Rule-of-Thirds Grid */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
                      <div className="border-r border-b border-white/60" />
                      <div className="border-r border-b border-white/60" />
                      <div className="border-b border-white/60" />
                      <div className="border-r border-b border-white/60" />
                      <div className="border-r border-b border-white/60" />
                      <div className="border-b border-white/60" />
                      <div className="border-r border-white/60" />
                      <div className="border-r border-white/60" />
                      <div />
                    </div>

                    {/* Live Camera Header Overlay */}
                    <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRecording ? 'bg-red-500 animate-ping' : 'bg-red-500 animate-pulse'
                          }`}
                        />
                        <span>{isRecording ? 'RECORDING CLIP' : cameraMode === 'video' ? 'VIDEO RECORDER' : 'PHOTO CAMERA'}</span>
                        {isRecording && (
                          <span className="font-mono text-red-300 ml-1 bg-red-950/80 px-1.5 py-0.5 rounded">
                            {formatTimer(recordingSeconds)} / 0:30
                          </span>
                        )}
                      </div>

                      {/* Flip Camera Button */}
                      <button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        disabled={isRecording}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-40"
                        title="Flip Camera (Front/Rear)"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">
                          {cameraFacingMode === 'user' ? 'Selfie' : 'Rear'}
                        </span>
                      </button>
                    </div>

                    {/* Shutter White Flash Animation */}
                    {shutterFlash && (
                      <div className="absolute inset-0 bg-white pointer-events-none z-30 animate-in fade-in duration-75" />
                    )}

                    {/* Camera Error / Permission Fallback View */}
                    {cameraError ? (
                      <div className="absolute inset-0 bg-black/90 p-4 flex flex-col items-center justify-center text-center text-xs text-white gap-3 z-20">
                        <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="text-red-300 max-w-xs">{cameraError}</p>
                        <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
                          >
                            Retry Permission
                          </button>
                          <button
                            type="button"
                            onClick={useSampleCameraVideo}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md flex items-center gap-1"
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span>Sample Video Clip</span>
                          </button>
                          <button
                            type="button"
                            onClick={useSampleCameraShot}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
                          >
                            Sample Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-xs cursor-pointer"
                          >
                            Device Camera App
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Camera Controls Bottom Bar */
                      <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-2 z-10 px-3">
                        {/* Mode Switcher: Video vs Photo */}
                        <div className="flex items-center gap-1 bg-black/65 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/20 shadow-md">
                          <button
                            type="button"
                            disabled={isRecording}
                            onClick={() => setCameraMode('video')}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              cameraMode === 'video'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-gray-300 hover:text-white'
                            }`}
                          >
                            <Video className="w-3 h-3" />
                            <span>VIDEO</span>
                          </button>
                          <button
                            type="button"
                            disabled={isRecording}
                            onClick={() => setCameraMode('photo')}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              cameraMode === 'photo'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-300 hover:text-white'
                            }`}
                          >
                            <Camera className="w-3 h-3" />
                            <span>PHOTO</span>
                          </button>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-center gap-6">
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-transform active:scale-95 cursor-pointer"
                            title="Close Camera"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Trigger Button: Record Video or Snap Photo */}
                          {cameraMode === 'video' ? (
                            isRecording ? (
                              <button
                                type="button"
                                onClick={stopRecordingVideo}
                                className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer animate-pulse"
                                title="Stop Recording Video Clip"
                              >
                                <div className="w-6 h-6 rounded-md bg-white shadow-md" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={startRecordingVideo}
                                className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer group/rec"
                                title="Start Recording Video Clip (up to 30s)"
                              >
                                <div className="w-11 h-11 rounded-full bg-white/30 group-hover/rec:bg-white/40 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-white" />
                                </div>
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="w-14 h-14 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 shadow-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer group/shutter"
                              title="Capture Photo"
                            >
                              <div className="w-10 h-10 rounded-full bg-white/30 group-hover/shutter:bg-white/40 flex items-center justify-center">
                                <Camera className="w-5 h-5 text-white" />
                              </div>
                            </button>
                          )}

                          {/* Flip Camera Secondary */}
                          <button
                            type="button"
                            disabled={isRecording}
                            onClick={toggleCameraFacingMode}
                            className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-transform active:scale-95 cursor-pointer disabled:opacity-40"
                            title="Flip camera"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>

                        <span className="text-[10px] text-white/90 font-medium drop-shadow-md">
                          {cameraMode === 'video'
                            ? isRecording
                              ? `Recording clip... ${formatTimer(recordingSeconds)} / 0:30 (tap stop to finish)`
                              : 'Tap red circle to record short video clip (up to 30s)'
                            : 'Tap shutter button to snap and attach photo'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Filter Selector Row while camera or preview is active */}
                {(isCameraActive || imageUrl || videoUrl) && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] pt-1">
                    <span className="text-gray-400 font-medium text-[10px] uppercase mr-1">Style:</span>
                    {[
                      { id: 'none', label: 'Normal' },
                      { id: 'warm', label: 'Warm ☀️' },
                      { id: 'vintage', label: 'Vintage 🎞️' },
                      { id: 'mono', label: 'B&W 🖤' },
                      { id: 'vibrant', label: 'Vibrant ✨' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFilter(f.id as any)}
                        className={`px-2 py-0.5 rounded-full border text-xs transition-colors cursor-pointer ${
                          selectedFilter === f.id
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Attached Video Clip Preview */}
                {videoUrl && !isCameraActive && (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-rose-500/60 shadow-md group max-h-72 flex items-center justify-center">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-72 object-contain bg-black"
                      style={{
                        filter:
                          selectedFilter === 'warm'
                            ? 'sepia(0.25) saturate(1.3)'
                            : selectedFilter === 'vintage'
                            ? 'sepia(0.45) contrast(1.1)'
                            : selectedFilter === 'mono'
                            ? 'grayscale(1)'
                            : selectedFilter === 'vibrant'
                            ? 'saturate(1.4)'
                            : 'none',
                      }}
                    />

                    {/* Camera Video Tag */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 shadow-md pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>{isCameraVideo ? 'Camera Video Clip Recorded' : 'Video Attached'}</span>
                    </div>

                    {/* Action buttons on video */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                      {/* Retake Camera Video Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCameraMode('video');
                          startCamera();
                        }}
                        className="px-2 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
                        title="Re-record video clip"
                      >
                        <RotateCcw className="w-3 h-3 text-rose-400" />
                        <span>Re-record</span>
                      </button>

                      {/* Remove Video Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl('');
                          setIsCameraVideo(false);
                        }}
                        className="p-1 rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Remove attached video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Attached Photo Preview */}
                {imageUrl && !isCameraActive && (
                  <div className="relative rounded-2xl overflow-hidden max-h-64 bg-slate-900 border border-emerald-500/60 shadow-md group">
                    <img
                      src={imageUrl}
                      alt="Attachment preview"
                      className="w-full h-full max-h-64 object-cover"
                      style={{
                        filter:
                          selectedFilter === 'warm'
                            ? 'sepia(0.25) saturate(1.3)'
                            : selectedFilter === 'vintage'
                            ? 'sepia(0.45) contrast(1.1)'
                            : selectedFilter === 'mono'
                            ? 'grayscale(1)'
                            : selectedFilter === 'vibrant'
                            ? 'saturate(1.4)'
                            : 'none',
                      }}
                    />

                    {/* Camera Photo Tag */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 shadow-md pointer-events-none">
                      {isCameraPhoto ? (
                        <>
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>Captured with Camera</span>
                        </>
                      ) : (
                        <>
                          <Image className="w-3 h-3 text-blue-400" />
                          <span>Photo Attached</span>
                        </>
                      )}
                    </div>

                    {/* Action buttons on photo */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {/* Retake Camera Photo Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCameraMode('photo');
                          startCamera();
                        }}
                        className="px-2 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
                        title="Retake photo using camera"
                      >
                        <RotateCcw className="w-3 h-3 text-emerald-400" />
                        <span>Retake</span>
                      </button>

                      {/* Remove Image Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setIsCameraPhoto(false);
                        }}
                        className="p-1 rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Remove attached photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* URL Input Fallback */}
                <div>
                  <input
                    type="text"
                    placeholder="Or paste media URL (image or mp4 video e.g. https://...)"
                    value={
                      imageUrl.startsWith('data:') || videoUrl.startsWith('blob:')
                        ? ''
                        : videoUrl || imageUrl
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
                        setVideoUrl(val);
                        setImageUrl('');
                        setIsCameraVideo(false);
                      } else {
                        setImageUrl(val);
                        setVideoUrl('');
                        setIsCameraPhoto(false);
                      }
                    }}
                    className={`w-full p-2 text-xs rounded-lg border outline-none ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Feelings Chip Selector */}
              <div>
                <span className="text-xs font-semibold block mb-1.5 text-gray-600 dark:text-gray-300">
                  How are you feeling?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {feelingsList.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFeeling(feeling === f ? '' : f)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        feeling === f
                          ? 'bg-[#1877F2] text-white border-[#1877F2] font-semibold'
                          : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Check In */}
              <div>
                <input
                  type="text"
                  placeholder="📍 Add location / Check in..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Submit Post Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !content.trim() &&
                    !imageUrl.trim() &&
                    !videoUrl.trim() &&
                    !(
                      isCreatingPoll &&
                      (pollQuestion.trim() || content.trim()) &&
                      pollOptions.filter((o) => o.trim()).length >= 2
                    )
                  }
                  className="px-6 py-2 text-xs font-bold text-white bg-[#1877F2] rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

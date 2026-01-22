import { useState, useRef, useCallback } from "react";

interface UseAudioRecordingProps {
  onRecordingComplete: (audioFile: File) => void;
}

export const useAudioRecording = ({
  onRecordingComplete,
}: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ============================================================================
  // START RECORDING
  // ============================================================================

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const audioFile = new File(
          [audioBlob],
          `voice_memo_${Date.now()}.webm`,
          {
            type: "audio/webm",
          }
        );

        // Wywołaj callback z gotowym plikiem
        onRecordingComplete(audioFile);

        // Zatrzymaj wszystkie ścieżki audio
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Nie można uzyskać dostępu do mikrofonu. Sprawdź uprawnienia.");
    }
  }, [onRecordingComplete]);

  // ============================================================================
  // STOP RECORDING
  // ============================================================================

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  // ============================================================================
  // TOGGLE RECORDING
  // ============================================================================

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // ============================================================================
  // CLEANUP - zatrzymaj nagrywanie przy unmount
  // ============================================================================

  const cleanup = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, [mediaRecorder]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
    cleanup,
  };
};

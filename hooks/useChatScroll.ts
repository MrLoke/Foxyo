import { useCallback, useEffect, useRef, useState } from "react";

interface UseChatScrollProps {
  messageCount: number;
}

export const useChatScroll = ({ messageCount }: UseChatScrollProps) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messageCount);
  const isInitialLoadRef = useRef(true);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getViewport = useCallback(() => {
    if (!scrollAreaRef.current) return null;
    return scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
  }, []);

  // ============================================================================
  // SCROLL TO BOTTOM
  // ============================================================================

  const scrollToBottom = useCallback(() => {
    const viewport = getViewport();
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "auto",
        });
      });

      setNewMessagesCount(0);
      setIsAtBottom(true);
    }
  }, [getViewport]);

  // ============================================================================
  // HANDLE SCROLL - wykrywa czy user jest na dole
  // ============================================================================

  const handleScroll = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;

    const buffer = 100;
    const isNearBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      buffer;

    setIsAtBottom(isNearBottom);

    if (isNearBottom) {
      setNewMessagesCount(0);
    }
  }, [getViewport]);

  // ============================================================================
  // AUTO-SCROLL LOGIC - scrolluj na dół przy nowych wiadomościach
  // ============================================================================

  useEffect(() => {
    const previousLength = prevMessagesLengthRef.current;
    const currentLength = messageCount;

    // Initial load - zawsze scrolluj na dół
    if (isInitialLoadRef.current && currentLength > 0) {
      scrollToBottom();
      isInitialLoadRef.current = false;
    }

    const newMessageArrived = currentLength > previousLength;
    const addedMessages = currentLength - previousLength;

    if (newMessageArrived) {
      if (isAtBottom) {
        // Jeśli user jest na dole, auto-scroll
        scrollToBottom();
      } else {
        // Jeśli user scrollował w górę, pokaż badge z liczbą nowych
        setNewMessagesCount((prevCount) => prevCount + addedMessages);
      }
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messageCount, isAtBottom, scrollToBottom]);

  // ============================================================================
  // ATTACH SCROLL LISTENER
  // ============================================================================

  useEffect(() => {
    const viewport = getViewport();

    if (viewport) {
      viewport.addEventListener("scroll", handleScroll);

      return () => {
        viewport.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, getViewport]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    scrollAreaRef,
    isAtBottom,
    newMessagesCount,
    scrollToBottom,
    handleScroll,
  };
};

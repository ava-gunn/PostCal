import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SharedContent, ExtractionResult } from '@/lib/extraction/types';

export type ExtractionStatus = 'idle' | 'extracting' | 'ready' | 'saving' | 'saved' | 'error';

export interface ExtractionState {
  sharedContent: SharedContent | null;
  extraction: ExtractionResult | null;
  userEdits: Partial<Omit<ExtractionResult, 'confidence' | 'rawText'>>;
  status: ExtractionStatus;
}

interface ExtractionContextValue extends ExtractionState {
  setSharedContent: (content: SharedContent) => void;
  setExtraction: (result: ExtractionResult | null) => void;
  setUserEdit: (field: keyof Omit<ExtractionResult, 'confidence' | 'rawText'>, value: string | null) => void;
  setStatus: (status: ExtractionStatus) => void;
  reset: () => void;
}

const initialState: ExtractionState = {
  sharedContent: null,
  extraction: null,
  userEdits: {},
  status: 'idle',
};

const ExtractionContext = createContext<ExtractionContextValue | null>(null);

export function ExtractionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExtractionState>(initialState);

  const setSharedContent = useCallback((content: SharedContent) => {
    setState(prev => ({ ...prev, sharedContent: content }));
  }, []);

  const setExtraction = useCallback((result: ExtractionResult | null) => {
    setState(prev => ({ ...prev, extraction: result }));
  }, []);

  const setUserEdit = useCallback((field: keyof Omit<ExtractionResult, 'confidence' | 'rawText'>, value: string | null) => {
    setState(prev => ({
      ...prev,
      userEdits: { ...prev.userEdits, [field]: value },
    }));
  }, []);

  const setStatus = useCallback((status: ExtractionStatus) => {
    setState(prev => ({ ...prev, status }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <ExtractionContext.Provider
      value={{
        ...state,
        setSharedContent,
        setExtraction,
        setUserEdit,
        setStatus,
        reset,
      }}
    >
      {children}
    </ExtractionContext.Provider>
  );
}

export function useExtraction(): ExtractionContextValue {
  const context = useContext(ExtractionContext);
  if (!context) {
    throw new Error('useExtraction must be used within an ExtractionProvider');
  }
  return context;
}

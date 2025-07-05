"use client";
import React, { createContext, useContext } from 'react';
import { useFilePickerLogic } from '../hooks/useFilePicker';

type FilePickerLogicType = ReturnType<typeof useFilePickerLogic>;
const FilePickerContext = createContext<FilePickerLogicType | null>(null);

export function FilePickerProvider({ children }: { children: React.ReactNode }) {
  const filePicker = useFilePickerLogic();
  return (
    <FilePickerContext.Provider value={filePicker}>
      {children}
    </FilePickerContext.Provider>
  );
}

export function useFilePicker() {
  const context = useContext(FilePickerContext);
  if (!context) {
    throw new Error('useFilePicker must be used within FilePickerProvider');
  }
  return context;
}
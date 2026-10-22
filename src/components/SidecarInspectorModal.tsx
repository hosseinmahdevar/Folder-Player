/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FolderPlay Sidecar Metadata Inspector Modal
 * Displays position.sabp.dat, bookmarks.sabp.xml, characters.sabp.xml, and info.txt
 */

import React, { useState } from 'react';
import { Book } from '../types';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  X, 
  HardDrive, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

interface SidecarInspectorModalProps {
  book: Book;
  onClose: () => void;
}

export const SidecarInspectorModal: React.FC<SidecarInspectorModalProps> = ({
  book,
  onClose
}) => {
  const [activeFile, setActiveFile] = useState<'position' | 'bookmarks' | 'characters' | 'info'>('position');
  const [copied, setCopied] = useState(false);

  const getFileContent = () => {
    switch (activeFile) {
      case 'position':
        return book.sidecars.positionDat;
      case 'bookmarks':
        return book.sidecars.bookmarksXml;
      case 'characters':
        return book.sidecars.charactersXml;
      case 'info':
        return book.sidecars.infoTxt;
    }
  };

  const getFileName = () => {
    switch (activeFile) {
      case 'position':
        return 'position.sabp.dat';
      case 'bookmarks':
        return 'bookmarks.sabp.xml';
      case 'characters':
        return 'characters.sabp.xml';
      case 'info':
        return 'info.txt';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getFileContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[var(--bg-surface-low)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl flex flex-col gap-5 hardware-plate-raised max-h-[90vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary-container)]/15 border border-[var(--primary-container)]/30 flex items-center justify-center text-[var(--primary-container)]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[var(--primary)]">
                Local Sidecar Metadata Inspector (.SABP)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {book.folderPath}/{getFileName()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portability Philosophy Banner */}
        <div className="bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] p-3 rounded-lg flex items-center gap-2.5 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-[var(--secondary)] shrink-0" />
          <span>
            <strong className="text-[var(--primary)] font-semibold">Zero-Cloud Philosophy:</strong> Progress, bookmarks, and character bios are saved as raw files directly in the book's folder. Moving this folder to an SD card or any other device preserves 100% of your progress with no cloud login.
          </span>
        </div>

        {/* File Tabs Toolbar */}
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFile('position')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                activeFile === 'position'
                  ? 'bg-[var(--primary-container)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              position.sabp.dat
            </button>

            <button
              onClick={() => setActiveFile('bookmarks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                activeFile === 'bookmarks'
                  ? 'bg-[var(--primary-container)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              bookmarks.sabp.xml
            </button>

            <button
              onClick={() => setActiveFile('characters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                activeFile === 'characters'
                  ? 'bg-[var(--primary-container)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              characters.sabp.xml
            </button>

            <button
              onClick={() => setActiveFile('info')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                activeFile === 'info'
                  ? 'bg-[var(--primary-container)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              info.txt
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-high)] hover:text-[var(--primary-container)] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="hardware-plate flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-high)] hover:text-[var(--primary-container)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export File</span>
            </button>
          </div>
        </div>

        {/* Raw Content Viewer */}
        <div className="flex-1 overflow-auto bg-[var(--bg-surface-lowest)] border border-[var(--border-subtle)] rounded-lg p-4 font-mono text-xs text-amber-100/90 leading-relaxed max-h-96 shadow-inner">
          <pre className="whitespace-pre-wrap select-text">
            {getFileContent()}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
          <span>Encoding: UTF-8 / Java Object Serialization</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--bg-surface-high)] text-white hover:bg-[var(--bg-surface-highest)] font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

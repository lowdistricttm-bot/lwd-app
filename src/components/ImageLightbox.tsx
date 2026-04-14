"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';

interface ImageLightboxProps {
  src: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox = ({ src, isOpen, onClose }: ImageLightboxProps) => {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = React.useState(true);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src) return;

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `low-district-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback se il fetch fallisce (es. CORS)
      window.open(src, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
        >
          <div className="absolute top-6 right-6 flex items-center gap-4 z-[310]">
            {isAdmin && (
              <button
                onClick={handleDownload}
                className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all"
                title="Scarica Originale"
              >
                <Download size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/20" size={40} />
              </div>
            )}
            <img
              src={src}
              alt="Full size"
              onLoad={() => setLoading(false)}
              className="max-w-full max-h-[90vh] object-contain shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
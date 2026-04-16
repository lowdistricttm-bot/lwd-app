<motion.div    key={currentIndex}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ type: "spring", damping: 25, stiffness: 200 }}
    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={(_, info) => {
      if (info.offset.x < -50) handleNext();
      else if (info.offset.x > 50) handlePrev();
    }}
    className="relative max-w-full max-h-[90vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={40} />
      </div>
    )}
    <img
      src={images[currentIndex]}
      alt={`Story ${currentIndex + 1}`}
      onLoad={() => setLoading(false)}
      className="max-w-full max-h-[90vh] object-contain shadow-2xl pointer-events-none"
    />
  </motion.div>

  {/* Desktop Navigation Arrows */}
  {images.length > 1 && (
    <>
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white rounded-full transition-all z-[310]"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white rounded-full transition-all z-[310]"
      >
        <ChevronRight size={32} />
      </button>
    </>
  )}

  {/* Download Button */}
  <button
    onClick={handleDownload}
    className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white text-white rounded-full transition-all"
    title="Download Original"
  >
    <Download size={20} />
  </button>

  {/* Close Button */}
  <button
    onClick={onClose}
    className="absolute top-4 left-4 p-3 bg-white/10 hover:bg-white text-white rounded-full transition-all"
  >
    <X size={20} />
  </button>
</motion.div>
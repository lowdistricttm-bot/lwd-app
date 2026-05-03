"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Heart, Trash2 } from "lucide-react";
import { useStories } from "@/hooks/use-stories";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialStoryIndex?: number;
}

const StoryViewer = ({ isOpen, onClose, initialStoryIndex = 0 }: StoryViewerProps) => {
  const { stories, toggleStoryLike, deleteStory } = useStories();
  const { user: currentUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);

  useEffect(() => {
    setCurrentIndex(initialStoryIndex);
  }, [initialStoryIndex]);

  if (!stories.length) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser || !currentStory) return;

    // Impedisce click multipli o like su storie già apprezzate
    if (toggleStoryLike.isPending || currentStory.is_liked) {
      return;
    }

    try {
      await toggleStoryLike.mutateAsync({
        storyId: currentStory.id,
        userId: currentUser.id,
      });
    } catch (error) {
      console.error("Like interaction error:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Sei sicuro di voler eliminare questa storia?")) {
      await deleteStory.mutateAsync(currentStory.id);
      if (stories.length <= 1) {
        onClose();
      } else {
        handleNext();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[450px] p-0 bg-black border-none h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl">
        <div className="relative flex-1 group">
          <img
            src={currentStory.image_url}
            alt="Story content"
            className="w-full h-full object-cover"
          />

          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
            {stories.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full bg-white transition-all duration-300",
                    idx === currentIndex ? "w-full" : idx < currentIndex ? "w-full" : "w-0"
                  )}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary p-0.5">
                <img
                  src={currentStory.user?.avatar_url || "/placeholder.svg"}
                  alt={currentStory.user?.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-white font-semibold text-sm shadow-sm">
                {currentStory.user?.username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Navigation Controls */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white/50 hover:text-white transition-opacity",
                currentIndex === 0 && "invisible"
              )}
              onClick={handlePrev}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-between z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={toggleStoryLike.isPending}
                className={cn(
                  "p-3 rounded-full transition-all duration-300 transform active:scale-125",
                  currentStory.is_liked 
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/50" 
                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                )}
              >
                <Heart
                  className={cn(
                    "w-6 h-6",
                    currentStory.is_liked && "fill-current"
                  )}
                />
              </button>
              {currentStory.likes_count > 0 && (
                <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  {currentStory.likes_count} {currentStory.likes_count === 1 ? 'like' : 'likes'}
                </span>
              )}
            </div>

            {currentUser?.id === currentStory.user_id && (
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full shadow-lg"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
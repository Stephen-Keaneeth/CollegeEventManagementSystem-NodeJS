import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { feedbackApi } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function FeedbackModal({ event, isOpen, onClose, onSuccess, initialFeedback }) {
  const [rating, setRating] = useState(initialFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(initialFeedback?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      toast.error('Please write a short review or feedback comment.');
      return;
    }

    try {
      setIsSubmitting(true);
      await feedbackApi.submit(event.id || event.event_id, rating, review.trim());
      toast.success('Thank you! Your feedback has been submitted.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" /> Student Event Feedback
            </div>
            <h3 className="text-lg font-bold truncate max-w-sm">{event.title || event.event_title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating Selector */}
          <div className="text-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              How would you rate this event experience?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transform hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        active
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-sm font-semibold text-slate-700 mt-2">
              {rating === 5 && '🌟 Outstanding & Highly Recommended'}
              {rating === 4 && '👍 Very Good & Informative'}
              {rating === 3 && '👌 Satisfactory'}
              {rating === 2 && '👎 Needs Improvement'}
              {rating === 1 && '⚠️ Poor Experience'}
            </div>
          </div>

          {/* Feedback Review Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Share your thoughts, suggestions, or highlights:
            </label>
            <textarea
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you enjoy most? What could organizers improve for next time?"
              className="w-full p-3.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

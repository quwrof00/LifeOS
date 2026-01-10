'use client';

import { useState, useEffect } from 'react';
import { useProfileStore } from '@/stores/userStore';
import Image from 'next/image';

export default function Page() {
  const [user, setUser] = useState<null | { name: string; image: string | null }>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setUsername(data.name || '');
          setImagePreview(data.image || null);
        } else {
          setError(data.error || 'Failed to load profile');
        }
      } catch {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(file);
      setImagePreview(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!username.trim()) {
        throw new Error('Username cannot be empty');
      }

      const formData = new FormData();
      formData.append('username', username.trim());

      if (image) {
        formData.append('image', image);
      }

      const shouldRemoveImage = !imagePreview && user?.image;
      formData.append('removeImage', shouldRemoveImage ? 'true' : 'false');

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update the UI immediately
      setSuccess('Profile updated successfully');
      setImage(null);

      // If we uploaded a new image, keep the preview
      // If we removed the image, clear the preview
      if (shouldRemoveImage) {
        setImagePreview(null);
      }
      useProfileStore.getState().setProfile({
        name: result.user.name,
        image: result.user.image,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-neon-blue font-medium">Initializing Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-8 relative overflow-hidden">

        <h1 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
          Operative Profile
        </h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          Manage your identity and credentials
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="relative z-10">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full border-2 border-white/10 object-cover shadow-2xl"
                    unoptimized={imagePreview.startsWith('data:')}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-neon-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="flex gap-3 w-full justify-center">
              <label className="cursor-pointer">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg border border-white/10 transition-all duration-300">
                  Update Photo
                </div>
              </label>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!imagePreview && !user?.image}
              >
                Remove
              </button>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your operative name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all"
              maxLength={50}
              required
            />
            <p className="text-[10px] text-gray-500 text-right font-mono">
              {username.length}/50
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
              {success}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/30 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
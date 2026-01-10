import { create } from 'zustand';

type Profile = {
  name: string;
  email?: string;
  image: string | null;
};

type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  setProfile: (data: Profile) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: true,
  fetchProfile: async () => {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (res.ok) {
      set({ profile: data, loading: false });
    } else {
      set({ profile: null, loading: false });
    }
  },
  setProfile: (data) => set({ profile: data }),
}));

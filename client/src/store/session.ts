import create from "zustand";
import * as uuid from "uuid";

interface SessionStore {
  uuid: string;
  username: string;
  isSessionInitialized: boolean;
  initialize: (username: string) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  uuid: "",
  username: "",
  isSessionInitialized: false,
  initialize: (username) => set((state) => ({ ...state, username, uuid: uuid.v4(), isSessionInitialized: true })),
}));

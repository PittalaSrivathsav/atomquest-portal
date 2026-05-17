export type UserRole = "user" | "manager" | "admin";

export type UserProfile = {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

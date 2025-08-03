// src/services/AuthService.js
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';

const AuthService = {
  // ... existing methods

  // Modified signup to accept first and last name
  signup: async (email, password, firstName, lastName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });
    return userCredential;
  },

  // NEW: Update the current user's displayName (first and last name)
  updateName: async (firstName, lastName) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently logged in.");
    }
    await updateProfile(auth.currentUser, {
      displayName: `${firstName} ${lastName}`
    });
  },

  updateEmail: async (newEmail) => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    await fbUpdateEmail(auth.currentUser, newEmail);
  },

  updatePassword: async (newPassword) => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    await fbUpdatePassword(auth.currentUser, newPassword);
  },

  deleteAccount: async () => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    await deleteUser(auth.currentUser);
  },

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};

export default AuthService;

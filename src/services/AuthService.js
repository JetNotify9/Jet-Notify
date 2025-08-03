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
  // logs in an existing user
  login: async (email, password) => {
    // returns a UserCredential
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // modified signup to accept first and last name
  signup: async (email, password, firstName, lastName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });
    return userCredential;
  },

  // logs out the currently-signed-in user
  logout: async () => {
    return await signOut(auth);
  },

  // updates display name
  updateName: async (firstName, lastName) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently logged in.");
    }
    await updateProfile(auth.currentUser, {
      displayName: `${firstName} ${lastName}`
    });
  },

  // updates email address
  updateEmail: async (newEmail) => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    await fbUpdateEmail(auth.currentUser, newEmail);
  },

  // updates password
  updatePassword: async (newPassword) => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    await fbUpdatePassword(auth.currentUser, newPassword);
  },

  // deletes the current user account
  deleteAccount: async () => {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    await deleteUser(auth.currentUser);
  },

  // listen for auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
};

export default AuthService;

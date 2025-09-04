// src/services/AuthService.js
// Complete AuthService using the Firebase v9 modular SDK.
// This file exports a default object `AuthService` with the methods:
// login(email, password), signup(email,password,displayName), logout(),
// updateEmail(newEmail), updatePassword(newPassword), updateName(name),
// deleteAccount(), onAuthStateChanged(callback)

import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  updateProfile as fbUpdateProfile,
  deleteUser as fbDeleteUser,
} from 'firebase/auth';

const AuthService = {
  // logs in an existing user
  login: async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required for login.');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // sign up a new user and optionally set displayName
  signup: async (email, password, displayName = null) => {
    if (!email || !password) throw new Error('Email and password are required for signup.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await fbUpdateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  },

  // logout current user
  logout: async () => {
    await signOut(auth);
  },

  // update the currently logged-in user's email
  updateEmail: async (newEmail) => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    if (!newEmail) throw new Error('A new email is required.');
    await fbUpdateEmail(auth.currentUser, newEmail);
    // return updated user
    return auth.currentUser;
  },

  // update the currently logged-in user's password
  updatePassword: async (newPassword) => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    if (!newPassword) throw new Error('A new password is required.');
    await fbUpdatePassword(auth.currentUser, newPassword);
    return auth.currentUser;
  },

  // update displayName
  updateName: async (name) => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    await fbUpdateProfile(auth.currentUser, { displayName: name });
    return auth.currentUser;
  },

  // delete the current user account
  deleteAccount: async () => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    await fbDeleteUser(auth.currentUser);
  },

  // listen for auth state changes; callback receives the firebase user (or null)
  onAuthStateChanged: (callback) => {
    return fbOnAuthStateChanged(auth, (user) => {
      // normalize user object if you want (uid, email, displayName)
      if (!user) {
        callback(null);
      } else {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
        });
      }
    });
  },
};

export default AuthService;

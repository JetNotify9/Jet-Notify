// src/services/AuthService.js
// Complete AuthService using the Firebase v9 modular SDK.
// This file exports a default object `AuthService` with the methods:
// login(email, password), signup(email, password, firstName, lastName), logout(),
// updateEmail(newEmail), updatePassword(newPassword), updateName(firstName, lastName),
// deleteAccount(), onAuthStateChanged(callback)

import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updatePassword as fbUpdatePassword,
  updateProfile as fbUpdateProfile,
  deleteUser as fbDeleteUser,
  verifyBeforeUpdateEmail as fbVerifyBeforeUpdateEmail,
} from 'firebase/auth';

const AuthService = {
  // logs in an existing user
  login: async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required for login.');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // sign up a new user and optionally set displayName (first + last composed)
  signup: async (email, password, firstName = null, lastName = null) => {
    if (!email || !password) throw new Error('Email and password are required for signup.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const composed = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (composed && userCredential.user) {
      await fbUpdateProfile(userCredential.user, { displayName: composed });
    }
    return userCredential.user;
  },

  // logout current user
  logout: async () => {
    await signOut(auth);
  },

  // update the currently logged-in user's email.
  // Note: Many Firebase projects require verifying the NEW email first.
  // This sends a verification link to the new address; the email change is applied after the link is opened.
  updateEmail: async (newEmail) => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    if (!newEmail) throw new Error('A new email is required.');
    try {
      await fbVerifyBeforeUpdateEmail(auth.currentUser, newEmail);
      // At this point a verification email has been sent. The change applies after the user clicks the link.
      return auth.currentUser;
    } catch (err) {
      // Re-throw with the original Firebase message so callers can surface it.
      throw err;
    }
  },

  // update the currently logged-in user's password
  updatePassword: async (newPassword) => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    if (!newPassword) throw new Error('A new password is required.');
    await fbUpdatePassword(auth.currentUser, newPassword);
    return auth.currentUser;
  },

  // update displayName using first + last composition
  updateName: async (firstName, lastName) => {
    if (!auth.currentUser) throw new Error('No user is currently logged in.');
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    await fbUpdateProfile(auth.currentUser, { displayName: fullName });
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

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Admin, Invitation } from "./types";

// Check if email is an active admin
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const adminsRef = collection(db, "admins");
    const q = query(
      adminsRef,
      where("email", "==", email.toLowerCase()),
      where("status", "==", "active")
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking admin email:", error);
    return false;
  }
}

// Check if email has a pending invitation
export async function hasPendingInvitation(
  email: string
): Promise<Invitation | null> {
  try {
    const invitationsRef = collection(db, "invitations");
    const q = query(
      invitationsRef,
      where("email", "==", email.toLowerCase()),
      where("used", "==", false)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const invitation = snapshot.docs[0].data() as Invitation;
    invitation.id = snapshot.docs[0].id;

    // Check if expired
    const expiresAt = invitation.expiresAt as any;
    if (expiresAt.toDate() < new Date()) {
      return null;
    }

    return invitation;
  } catch (error) {
    console.error("Error checking pending invitation:", error);
    return null;
  }
}

// Get all admins
export async function getAllAdmins(): Promise<Admin[]> {
  try {
    const adminsRef = collection(db, "admins");
    const snapshot = await getDocs(adminsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Admin[];
  } catch (error) {
    console.error("Error getting admins:", error);
    return [];
  }
}

// Create invitation
export async function createInvitation(
  email: string,
  invitedBy: string
): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  try {
    // Check if already an admin
    const isAdmin = await isAdminEmail(email);
    if (isAdmin) {
      return { success: false, error: "User is already an admin" };
    }

    // Check if already has pending invitation
    const pending = await hasPendingInvitation(email);
    if (pending) {
      return { success: false, error: "User already has a pending invitation" };
    }

    // Generate token
    const token = crypto.randomUUID();

    // Create invitation
    const invitationsRef = collection(db, "invitations");
    const invitationDoc = doc(invitationsRef);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await setDoc(invitationDoc, {
      email: email.toLowerCase(),
      token,
      invitedBy,
      expiresAt,
      used: false,
      createdAt: serverTimestamp(),
    });

    // Also create pending admin record
    const adminsRef = collection(db, "admins");
    const adminDoc = doc(adminsRef);

    await setDoc(adminDoc, {
      email: email.toLowerCase(),
      role: "admin",
      status: "pending",
      invitedBy,
      invitedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, invitationId: invitationDoc.id };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { success: false, error: "Failed to create invitation" };
  }
}

// Accept invitation
export async function acceptInvitation(
  token: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find invitation by token
    const invitationsRef = collection(db, "invitations");
    const q = query(invitationsRef, where("token", "==", token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: "Invalid invitation" };
    }

    const invitationDoc = snapshot.docs[0];
    const invitation = invitationDoc.data() as Invitation;

    // Check if already used
    if (invitation.used) {
      return { success: false, error: "Invitation already used" };
    }

    // Check if expired
    const expiresAt = invitation.expiresAt as any;
    if (expiresAt.toDate() < new Date()) {
      return { success: false, error: "Invitation expired" };
    }

    // Mark invitation as used
    await updateDoc(invitationDoc.ref, {
      used: true,
    });

    // Update admin record
    const adminsRef = collection(db, "admins");
    const adminQuery = query(
      adminsRef,
      where("email", "==", invitation.email)
    );
    const adminSnapshot = await getDocs(adminQuery);

    if (!adminSnapshot.empty) {
      const adminDoc = adminSnapshot.docs[0];
      await updateDoc(adminDoc.ref, {
        name,
        status: "active",
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

// Validate invitation token
export async function validateInvitationToken(
  token: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  try {
    const invitationsRef = collection(db, "invitations");
    const q = query(invitationsRef, where("token", "==", token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { valid: false, error: "Invalid invitation" };
    }

    const invitation = snapshot.docs[0].data() as Invitation;

    if (invitation.used) {
      return { valid: false, error: "Invitation already used" };
    }

    const expiresAt = invitation.expiresAt as any;
    if (expiresAt.toDate() < new Date()) {
      return { valid: false, error: "Invitation expired" };
    }

    return { valid: true, email: invitation.email };
  } catch (error) {
    console.error("Error validating token:", error);
    return { valid: false, error: "Failed to validate invitation" };
  }
}


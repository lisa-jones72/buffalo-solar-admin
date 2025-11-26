import { NextRequest, NextResponse } from "next/server";
import { createInvitation } from "@/lib/admin";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, invitedBy } = await request.json();

    if (!email || !invitedBy) {
      return NextResponse.json(
        { error: "Email and invitedBy are required" },
        { status: 400 }
      );
    }

    const result = await createInvitation(email, invitedBy);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Generate invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite/${result.invitationId}`;

    // Send invitation email
    const emailResult = await sendInvitationEmail(email, inviteLink, invitedBy);

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Don't fail the whole request, just log the error
      // The invitation link can still be shared manually
    }

    return NextResponse.json({
      success: true,
      invitationId: result.invitationId,
      inviteLink,
      emailSent: emailResult.success,
      message: emailResult.success
        ? "Invitation sent successfully via email"
        : "Invitation created (email failed - share link manually)",
    });
  } catch (error) {
    console.error("Error in invite API:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}


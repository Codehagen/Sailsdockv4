"use server";

import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get current user's ID
 */
async function getCurrentUserId(): Promise<string> {
  const session = await getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  return session.user.id;
}

/**
 * Get current user's workspace ID
 */
async function getCurrentUserWorkspaceId(): Promise<string> {
  const session = await getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { workspaceId: true },
  });

  if (!user?.workspaceId) {
    throw new Error("No workspace found for user");
  }

  return user.workspaceId;
}

/**
 * Create a new activity for a business
 */
export async function createBusinessActivity(
  businessId: string,
  data: {
    type: ActivityType;
    description: string;
    date: Date;
    completed?: boolean;
    outcome?: string;
    contactId?: string;
  }
) {
  try {
    // Get current user ID for attribution
    const userId = await getCurrentUserId();

    // Get workspace ID for verification
    const workspaceId = await getCurrentUserWorkspaceId();

    // Verify business belongs to workspace
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        workspaceId,
      },
      select: { id: true },
    });

    if (!business) {
      throw new Error("Business not found in workspace");
    }

    // Verify contact belongs to business if contactId is provided
    if (data.contactId) {
      const contact = await prisma.contact.findFirst({
        where: {
          id: data.contactId,
          businessId,
        },
        select: { id: true },
      });

      if (!contact) {
        throw new Error("Contact not found for this business");
      }
    }

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        ...data,
        businessId,
        userId,
        completed: data.completed ?? false,
      },
    });

    // Revalidate business page to show the new activity in the timeline
    revalidatePath(`/businesses/${businessId}`);

    return activity;
  } catch (error) {
    console.error(`Error creating business activity:`, error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create activity"
    );
  }
}

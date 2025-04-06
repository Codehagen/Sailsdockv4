"use server";

import { getServerSession } from "@/lib/auth/server";
import prisma from "@/lib/db";

/**
 * Fetches upcoming activities that require action
 */
export async function getUpcomingActivities(limit = 5) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return [];
  }

  // Get the user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.workspaceId) {
    return [];
  }

  const now = new Date();

  return await prisma.activity.findMany({
    where: {
      AND: [
        { completed: false },
        { date: { gte: now } },
        {
          OR: [
            { business: { workspaceId: user.workspaceId } },
            { jobApplication: { workspaceId: user.workspaceId } },
          ],
        },
      ],
    },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      business: true,
      contact: true,
      jobApplication: true,
      Ticket: true,
    },
  });
}

/**
 * Mark an activity as completed
 */
export async function completeActivity(activityId: string) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  // Get the user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.workspaceId) {
    throw new Error("Not authorized");
  }

  // Verify activity belongs to user's workspace
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      OR: [
        { business: { workspaceId: user.workspaceId } },
        { jobApplication: { workspaceId: user.workspaceId } },
      ],
    },
  });

  if (!activity) {
    throw new Error("Activity not found or access denied");
  }

  return await prisma.activity.update({
    where: { id: activityId },
    data: {
      completed: true,
      updatedAt: new Date(),
    },
  });
}

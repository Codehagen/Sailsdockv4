"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface SearchResult {
  people: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  }[];
  businesses: {
    id: string;
    name: string;
    industry?: string;
    email?: string;
    notes?: string;
    customerSegment?: string;
  }[];
  debug?: {
    query: string;
    totalContacts: number;
    totalBusinesses: number;
    industryCounts?: Record<string, number>;
    error?: string;
  };
}

interface BusinessResult {
  id: string;
  name: string;
  industry: string | null;
  email: string;
  notes: string | null;
  customerSegment: string | null;
}

export async function searchContactsAndBusinesses(
  query: string
): Promise<SearchResult> {
  console.log(`[CommandSearch] Searching for: "${query}"`);

  try {
    if (!query || query.length < 2) {
      return {
        people: [],
        businesses: [],
        debug: {
          query,
          totalContacts: 0,
          totalBusinesses: 0,
        },
      };
    }

    // Get some sample data to debug
    const totalContacts = await prisma.contact.count();
    const totalBusinesses = await prisma.business.count();

    console.log(
      `[CommandSearch] Total records: ${totalContacts} contacts, ${totalBusinesses} businesses`
    );

    // Get industry distribution to debug
    const industries = await prisma.business.groupBy({
      by: ["industry"],
      _count: {
        industry: true,
      },
      where: {
        industry: {
          not: null,
        },
      },
    });

    const industryCounts: Record<string, number> = {};
    industries.forEach((item) => {
      if (item.industry) {
        industryCounts[item.industry] = item._count.industry;
      }
    });

    console.log("[CommandSearch] Industry distribution:", industryCounts);

    // Sample some data
    const sampleContacts = await prisma.contact.findMany({
      take: 3,
      select: { name: true, email: true },
    });

    const sampleBusinesses = await prisma.business.findMany({
      take: 3,
      select: {
        name: true,
        industry: true,
        notes: true,
        customerSegment: true,
      },
    });

    console.log("[CommandSearch] Sample contacts:", sampleContacts);
    console.log("[CommandSearch] Sample businesses:", sampleBusinesses);

    // Search for contacts
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { position: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      take: 5, // Limit to 5 results
    });

    console.log(
      `[CommandSearch] Found ${contacts.length} contacts for query "${query}"`
    );

    // Search for businesses with expanded fields
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { industry: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
          { customerSegment: { contains: query, mode: "insensitive" } },
          { contractType: { contains: query, mode: "insensitive" } },
          { accountManager: { contains: query, mode: "insensitive" } },
          { contactPerson: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        industry: true,
        email: true,
        notes: true,
        customerSegment: true,
      },
      take: 5, // Limit to 5 results
    });

    console.log(
      `[CommandSearch] Found ${businesses.length} businesses for query "${query}"`
    );
    console.log(`[CommandSearch] Businesses found:`, businesses);

    return {
      people: contacts,
      businesses: businesses.map((b: BusinessResult) => ({
        id: b.id,
        name: b.name,
        industry: b.industry || undefined,
        email: b.email,
        notes: b.notes || undefined,
        customerSegment: b.customerSegment || undefined,
      })),
      debug: {
        query,
        totalContacts,
        totalBusinesses,
        industryCounts,
      },
    };
  } catch (error) {
    console.error("[CommandSearch] Error searching:", error);
    return {
      people: [],
      businesses: [],
      debug: {
        query,
        totalContacts: 0,
        totalBusinesses: 0,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

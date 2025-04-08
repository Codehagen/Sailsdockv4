"use client";

import React, { useEffect, useState } from "react";
import {
  Timeline,
  TimelineContent,
  TimelineItem,
} from "@/components/timeline/timeline";
import {
  Building2,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  User,
  CalendarClock,
  Ticket,
  MessageCircle,
  Tag,
  AlertCircle,
  LucideIcon,
  Banknote,
  CheckCircle,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Import from the correct path
import { TimelineEvent, getBusinessTimeline } from "@/app/actions/timeline";

interface BusinessTimelineProps {
  businessId: string;
  limit?: number;
  includeSms?: boolean;
  includeEmails?: boolean;
  includeTickets?: boolean;
  includeActivities?: boolean;
  includeOffers?: boolean;
  showFilters?: boolean;
}

export function BusinessTimeline({
  businessId,
  limit = 20,
  includeSms = true,
  includeEmails = true,
  includeTickets = true,
  includeActivities = true,
  includeOffers = true,
  showFilters = true,
}: BusinessTimelineProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    includeSms,
    includeEmails,
    includeTickets,
    includeActivities,
    includeOffers,
  });

  // Fetch timeline events
  const fetchEvents = async (newPage = page, newFilters = filters) => {
    try {
      setIsLoading(true);
      const timelineEvents = await getBusinessTimeline(businessId, {
        page: newPage,
        limit,
        ...newFilters,
      });

      if (newPage === 1) {
        setEvents(timelineEvents);
      } else {
        setEvents((prev) => [...prev, ...timelineEvents]);
      }

      setHasMore(timelineEvents.length === limit);
      setPage(newPage);
    } catch (error) {
      console.error("Failed to load timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchEvents(1);
  }, [businessId]);

  // Update when filters change
  const handleFilterChange = (filterKey: keyof typeof filters) => {
    const newFilters = {
      ...filters,
      [filterKey]: !filters[filterKey as keyof typeof filters],
    };
    setFilters(newFilters);
    fetchEvents(1, newFilters);
  };

  // Load more events
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchEvents(page + 1);
    }
  };

  // Get icon based on event type
  const getEventIcon = (type: TimelineEvent["type"]): LucideIcon => {
    switch (type) {
      case "business_created":
        return Building2;
      case "contact_created":
        return User;
      case "activity":
        return CalendarClock;
      case "email":
        return Mail;
      case "sms":
        return MessageSquare;
      case "offer_created":
      case "offer_status_changed":
        return Banknote;
      case "ticket_created":
      case "ticket_updated":
        return Ticket;
      case "ticket_comment":
        return MessageCircle;
      case "status_changed":
        return Tag;
      default:
        return FileText;
    }
  };

  // Get relative time string (like "2 minutes ago")
  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sekunder siden`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minutt" : "minutter"} siden`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "time" : "timer"} siden`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "dag" : "dager"} siden`;
    }
  };

  // Get status badge variant based on status
  const getStatusVariant = (status?: string) => {
    if (!status) return "outline";

    switch (status) {
      case "completed":
      case "accepted":
      case "resolved":
        return "default";
      case "pending":
      case "in_progress":
      case "sent":
        return "secondary";
      case "rejected":
      case "failed":
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get action text based on event type
  const getActionText = (event: TimelineEvent): string => {
    switch (event.type) {
      case "business_created":
        return "opprettet bedriften";
      case "contact_created":
        return "la til kontaktperson";
      case "activity":
        return "registrerte aktivitet";
      case "email":
        return event.metadata?.direction === "inbound"
          ? "mottok e-post"
          : "sendte e-post";
      case "sms":
        return event.metadata?.direction === "inbound"
          ? "mottok SMS"
          : "sendte SMS";
      case "offer_created":
        return "opprettet tilbud";
      case "offer_status_changed":
        return "oppdaterte tilbudsstatus";
      case "ticket_created":
        return "opprettet support sak";
      case "ticket_updated":
        return "oppdaterte support sak";
      case "ticket_comment":
        return "kommenterte på support sak";
      case "status_changed":
        return "endret status";
      default:
        return "utførte handling";
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[40px] w-full" />
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[60px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge
            variant={filters.includeActivities ? "default" : "outline"}
            onClick={() => handleFilterChange("includeActivities")}
            className="cursor-pointer"
          >
            <CalendarClock className="mr-1 h-3 w-3" />
            Aktiviteter
          </Badge>
          <Badge
            variant={filters.includeEmails ? "default" : "outline"}
            onClick={() => handleFilterChange("includeEmails")}
            className="cursor-pointer"
          >
            <Mail className="mr-1 h-3 w-3" />
            E-poster
          </Badge>
          <Badge
            variant={filters.includeSms ? "default" : "outline"}
            onClick={() => handleFilterChange("includeSms")}
            className="cursor-pointer"
          >
            <MessageSquare className="mr-1 h-3 w-3" />
            SMS
          </Badge>
          <Badge
            variant={filters.includeTickets ? "default" : "outline"}
            onClick={() => handleFilterChange("includeTickets")}
            className="cursor-pointer"
          >
            <Ticket className="mr-1 h-3 w-3" />
            Support
          </Badge>
          <Badge
            variant={filters.includeOffers ? "default" : "outline"}
            onClick={() => handleFilterChange("includeOffers")}
            className="cursor-pointer"
          >
            <Banknote className="mr-1 h-3 w-3" />
            Tilbud
          </Badge>
        </div>
      )}

      <div className="text-muted-foreground text-xs font-medium">
        Aktiviteter
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Ingen aktiviteter funnet</p>
        </div>
      ) : (
        <Timeline>
          {events.map((event, index) => {
            const EventIcon = getEventIcon(event.type);
            const userName = event.user?.name || "System";
            return (
              <TimelineItem
                key={event.id}
                step={index + 1}
                className="flex-row items-center gap-3 py-2.5"
              >
                <EventIcon className="text-muted-foreground/80" size={16} />
                <TimelineContent className="text-foreground">
                  <span className="font-medium">{userName}</span>
                  <span className="font-normal">
                    {" "}
                    {getActionText(event)}{" "}
                    {event.href ? (
                      <Link href={event.href} className="hover:underline">
                        {event.title}
                      </Link>
                    ) : (
                      event.title
                    )}{" "}
                    <span className="text-muted-foreground text-xs">
                      {getRelativeTimeString(event.date)}
                    </span>
                  </span>

                  {event.description && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </div>
                  )}

                  {event.status && (
                    <Badge
                      variant={getStatusVariant(event.status)}
                      className="mt-1.5 text-xs"
                    >
                      {event.status}
                    </Badge>
                  )}
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      )}

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full mt-4"
        >
          {isLoading ? "Laster..." : "Last flere"}
        </Button>
      )}
    </div>
  );
}

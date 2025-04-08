"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Ticket,
  Clock,
  Plus,
  AlertCircle,
  MessageCircle,
  User,
  Tag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { getTickets } from "@/app/actions/tickets";
import Link from "next/link";

interface BusinessTicketsProps {
  businessId: string;
}

export function BusinessTickets({ businessId }: BusinessTicketsProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets when component mounts or businessId changes
  useEffect(() => {
    fetchTickets();
  }, [businessId]);

  // Fetch business tickets
  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getTickets({ businessId });
      setTickets(result);
    } catch (error) {
      setError("An error occurred while fetching tickets");
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d. MMM yyyy", { locale: nb });
  };

  // Get status badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "secondary";
      case "in_progress":
        return "default";
      case "resolved":
        return "outline";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  // Get priority badge variant based on priority
  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  // Format status text
  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case "open":
        return "Åpen";
      case "in_progress":
        return "Under arbeid";
      case "resolved":
        return "Løst";
      case "closed":
        return "Lukket";
      default:
        return status;
    }
  };

  // Format priority text
  const formatPriority = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "Haster";
      case "high":
        return "Høy";
      case "medium":
        return "Medium";
      case "low":
        return "Lav";
      default:
        return priority;
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 text-center border border-destructive/20 bg-destructive/10 rounded-md">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchTickets}
          >
            Prøv igjen
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium">Innboks</h2>
          <Badge variant="outline" className="text-sm">
            {tickets.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Opprett sak
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[60px] w-full" />
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div>
          <div className="rounded-md border">
            <div className="divide-y">
              {tickets.map((ticket) => (
                <Link
                  href={`/tickets/${ticket.id}`}
                  key={ticket.id}
                  className="flex items-center px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {ticket.title}
                      </span>
                      <Badge
                        variant={getStatusVariant(ticket.status)}
                        className="text-xs"
                      >
                        {formatStatus(ticket.status)}
                      </Badge>
                      {ticket.priority && (
                        <Badge
                          variant={getPriorityVariant(ticket.priority)}
                          className="text-xs"
                        >
                          {formatPriority(ticket.priority)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex mt-1 text-xs text-muted-foreground space-x-4">
                      {ticket.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.assignee}
                        </span>
                      )}
                      {ticket.commentCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {ticket.commentCount}
                        </span>
                      )}
                      {ticket.tags && ticket.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {ticket.tags[0]}
                          {ticket.tags.length > 1
                            ? ` +${ticket.tags.length - 1}`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap pl-4">
                    {formatDate(ticket.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border p-8 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">Ingen saker</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Det er ingen saker tilknyttet denne bedriften ennå.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="flex mx-auto items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Opprett sak
          </Button>
        </div>
      )}
    </div>
  );
}

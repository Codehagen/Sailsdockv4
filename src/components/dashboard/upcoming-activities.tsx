"use client";

import { useState } from "react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Activity as ActivityType,
  ActivityType as ActivityTypeEnum,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  Check,
  MessageSquare,
  Phone,
  UserRound,
  Building,
} from "lucide-react";
import { completeActivity } from "@/app/actions/activities";
import { toast } from "sonner";

// Type for the activity with included relations
type ActivityWithRelations = ActivityType & {
  business: { id: string; name: string } | null;
  contact: { id: string; name: string } | null;
  jobApplication: { id: string; firstName: string; lastName: string } | null;
  Ticket: { id: string; title: string } | null;
};

interface UpcomingActivitiesProps {
  activities: ActivityWithRelations[];
}

export function UpcomingActivities({ activities }: UpcomingActivitiesProps) {
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  // Handler for marking activity as complete
  const handleComplete = async (id: string) => {
    try {
      setCompletingIds((prev) => new Set(prev).add(id));
      await completeActivity(id);
      toast.success("Aktivitet fullført", {
        description: "Aktiviteten er markert som fullført",
      });
      // Note: In a real app, you might want to refresh the activities list or remove this item
    } catch (error) {
      toast.error("Feil", {
        description: "Kunne ikke fullføre aktiviteten",
      });
    } finally {
      setCompletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Helper to get activity icon based on type
  const getActivityIcon = (type: ActivityTypeEnum) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "meeting":
        return <UserRound className="h-4 w-4" />;
      case "email":
        return <MessageSquare className="h-4 w-4" />;
      case "note":
      default:
        return <CalendarClock className="h-4 w-4" />;
    }
  };

  // Helper to get related entity name
  const getRelatedEntityInfo = (activity: ActivityWithRelations) => {
    if (activity.business) {
      return {
        name: activity.business.name,
        type: "Bedrift",
        icon: <Building className="h-4 w-4" />,
        link: `/customers/${activity.business.id}`,
      };
    }

    if (activity.contact) {
      return {
        name: activity.contact.name,
        type: "Kontakt",
        icon: <UserRound className="h-4 w-4" />,
        link: `/contacts/${activity.contact.id}`,
      };
    }

    if (activity.jobApplication) {
      const fullName = `${activity.jobApplication.firstName} ${activity.jobApplication.lastName}`;
      return {
        name: fullName,
        type: "Jobbsøker",
        icon: <UserRound className="h-4 w-4" />,
        link: `/applications/${activity.jobApplication.id}`,
      };
    }

    if (activity.Ticket) {
      return {
        name: activity.Ticket.title,
        type: "Sak",
        icon: <MessageSquare className="h-4 w-4" />,
        link: `/tickets/${activity.Ticket.id}`,
      };
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Kommende aktiviteter
        </CardTitle>
        <CardDescription>
          Aktiviteter som trenger din oppmerksomhet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const relatedEntity = getRelatedEntityInfo(activity);

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 border-b pb-3 last:border-0"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type === "call"
                          ? "Telefon"
                          : activity.type === "meeting"
                          ? "Møte"
                          : activity.type === "email"
                          ? "E-post"
                          : "Notat"}
                      </Badge>
                    </div>

                    {relatedEntity && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {relatedEntity.icon}
                        <span>{relatedEntity.type}:</span>
                        <a
                          href={relatedEntity.link}
                          className="text-blue-600 hover:underline"
                        >
                          {relatedEntity.name}
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      Forfaller:{" "}
                      {format(new Date(activity.date), "PPP", { locale: nb })}
                    </p>

                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={completingIds.has(activity.id)}
                        onClick={() => handleComplete(activity.id)}
                      >
                        {completingIds.has(activity.id) ? (
                          <span>Fullfører...</span>
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            <span>Marker som fullført</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Ingen kommende aktiviteter</p>
          </div>
        )}

        <div className="mt-4">
          <Button variant="outline" className="w-full" asChild>
            <a href="/activities">Se alle aktiviteter</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

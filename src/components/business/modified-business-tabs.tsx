"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Check,
  FileText,
  File,
  Mail,
  CalendarClock,
} from "lucide-react";
import { BusinessActivities } from "./business-activities";
import { BusinessEmailHistory } from "./business-email-history";
import { BusinessSmsHistory } from "./business-sms-history";
import { BusinessContacts } from "./business-contacts";
import { Business } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { BusinessTimeline } from "@/components/timeline/business-timeline";
import { BusinessTickets } from "./business-tickets";
import { BusinessNotes } from "./business-notes";

interface ModifiedBusinessTabsProps {
  business: Business & {
    contacts: any[];
    activities: any[];
  };
}

export function ModifiedBusinessTabs({ business }: ModifiedBusinessTabsProps) {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <div className="flex">
          <TabItem
            icon={<Clock className="h-4 w-4" />}
            label="Tidslinje"
            isActive={activeTab === "timeline"}
            onClick={() => setActiveTab("timeline")}
          />
          <TabItem
            icon={<Check className="h-4 w-4" />}
            label="Oppgaver"
            isActive={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          />
          <TabItem
            icon={<FileText className="h-4 w-4" />}
            label="Notater"
            isActive={activeTab === "notes"}
            onClick={() => setActiveTab("notes")}
          />
          <TabItem
            icon={<Mail className="h-4 w-4" />}
            label="E-poster"
            isActive={activeTab === "emails"}
            onClick={() => setActiveTab("emails")}
          />
        </div>
      </div>

      <div className="flex-1 p-4">
        {activeTab === "timeline" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tidslinje</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <CalendarClock className="h-3.5 w-3.5" />
                Legg til aktivitet
              </Button>
            </div>
            <BusinessTimeline
              businessId={business.id}
              showFilters={false}
              includeActivities={true}
              includeEmails={true}
              includeSms={true}
              includeTickets={true}
              includeOffers={true}
            />
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <BusinessTickets businessId={business.id} />
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <BusinessNotes business={business} />
          </div>
        )}

        {activeTab === "emails" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">E-poster</h2>
              <Button variant="outline" size="sm">
                Skriv e-post
              </Button>
            </div>
            <BusinessEmailHistory businessId={business.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? "border-black text-black"
          : "border-transparent text-muted-foreground hover:text-black hover:border-gray-200"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

// EmptyState component for empty tabs
function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button variant="outline" size="sm">
        {action}
      </Button>
    </div>
  );
}

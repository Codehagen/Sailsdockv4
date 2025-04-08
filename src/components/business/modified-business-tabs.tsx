"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Check, FileText, File, Mail } from "lucide-react";
import { BusinessActivities } from "./business-activities";
import { BusinessEmailHistory } from "./business-email-history";
import { BusinessSmsHistory } from "./business-sms-history";
import { BusinessContacts } from "./business-contacts";
import { Business } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface ModifiedBusinessTabsProps {
  business: Business & {
    contacts: any[];
    activities: any[];
  };
}

export function ModifiedBusinessTabs({ business }: ModifiedBusinessTabsProps) {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <Tabs
      defaultValue="timeline"
      className="w-full"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid grid-cols-5 w-full mb-6">
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Timeline</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Tasks</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Notes</span>
        </TabsTrigger>
        <TabsTrigger value="files" className="flex items-center gap-2">
          <File className="h-4 w-4" />
          <span>Files</span>
        </TabsTrigger>
        <TabsTrigger value="emails" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Emails</span>
        </TabsTrigger>
      </TabsList>

      <div className="border rounded-md">
        <TabsContent value="timeline" className="p-4 m-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Timeline</h2>
            <Button variant="outline" size="sm">
              Add Activity
            </Button>
          </div>
          <BusinessActivities
            businessId={business.id}
            activities={business.activities}
          />
        </TabsContent>

        <TabsContent value="tasks" className="p-4 m-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Button variant="outline" size="sm">
              Add Task
            </Button>
          </div>
          <EmptyState
            title="No tasks"
            description="There are no tasks for this business yet."
            action="Add Task"
          />
        </TabsContent>

        <TabsContent value="notes" className="p-4 m-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notes</h2>
            <Button variant="outline" size="sm">
              Add Note
            </Button>
          </div>
          {business.notes ? (
            <div className="border rounded-md p-4">
              <p>{business.notes}</p>
            </div>
          ) : (
            <EmptyState
              title="No notes"
              description="There are no notes for this business yet."
              action="Add Note"
            />
          )}
        </TabsContent>

        <TabsContent value="files" className="p-4 m-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Files</h2>
            <Button variant="outline" size="sm">
              Upload File
            </Button>
          </div>
          <EmptyState
            title="No files"
            description="There are no files for this business yet."
            action="Upload File"
          />
        </TabsContent>

        <TabsContent value="emails" className="p-4 m-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Emails</h2>
            <Button variant="outline" size="sm">
              Compose Email
            </Button>
          </div>
          <BusinessEmailHistory businessId={business.id} />
        </TabsContent>
      </div>
    </Tabs>
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

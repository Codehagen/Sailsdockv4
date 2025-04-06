import { getSupportMetrics } from "@/app/actions/tickets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export async function SupportOverview() {
  // Fetch support metrics
  const metrics = await getSupportMetrics();

  // Format hours to a readable format
  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${Math.round(hours * 10) / 10} t`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Support Oversikt
        </CardTitle>
        <CardDescription>
          Oversikt over supportsaker og responstider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* KPI Cards */}
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Åpne saker</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{metrics.openTickets}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalTickets} totalt
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">
                Høy prioritet
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {metrics.highPriorityTickets}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.overdueTickets} forfalt
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Løst siste uke
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {metrics.resolvedLastWeek}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(metrics.resolutionRate)}% løsningsgrad
            </p>
          </div>

          <div className="rounded-lg border bg-card p-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Gjennomsnittlige tider
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm font-medium">Første respons</p>
                <p className="text-xl font-bold">
                  {formatHours(metrics.avgFirstResponseHours)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Løsningstid</p>
                <p className="text-xl font-bold">
                  {formatHours(metrics.avgResolutionHours)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">
                Forfaller snart
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {metrics.upcomingDueTickets}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Innen 3 dager</p>
          </div>
        </div>

        {/* High Priority Tickets */}
        {metrics.urgentTickets.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Kritiske saker</h3>
            <div className="space-y-2">
              {metrics.urgentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        ticket.priority === "urgent" ? "destructive" : "default"
                      }
                    >
                      {ticket.priority === "urgent" ? "Kritisk" : "Høy"}
                    </Badge>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {ticket.title}
                    </span>
                  </div>
                  {ticket.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.dueDate).toLocaleDateString("no-NO")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link href="/tickets">
            <Button variant="outline" className="w-full">
              <span>Alle supportsaker</span>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

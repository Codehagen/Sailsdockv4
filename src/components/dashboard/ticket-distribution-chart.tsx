import { getTicketDistributionStats } from "@/app/actions/tickets";
import { TicketChart } from "./ticket-chart";

export async function TicketDistributionChart() {
  // Fetch ticket distribution data
  try {
    const { distributionData, totalTickets } =
      await getTicketDistributionStats();

    // If there's no data, don't render the chart
    if (!distributionData.length || totalTickets === 0) {
      return (
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
          <p>Ingen saker funnet.</p>
          <p className="text-sm mt-1">Opprett saker for å se statistikk.</p>
        </div>
      );
    }

    // Render the chart with the data
    return <TicketChart data={distributionData} totalTickets={totalTickets} />;
  } catch (error) {
    // Handle errors gracefully
    console.error("Error loading ticket distribution data:", error);
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        <p>Kunne ikke laste statistikk.</p>
        <p className="text-sm mt-1">Prøv igjen senere.</p>
      </div>
    );
  }
}

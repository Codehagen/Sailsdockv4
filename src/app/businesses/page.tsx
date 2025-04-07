"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Business } from "@prisma/client";

import { getAllBusinesses } from "../actions/businesses/actions";
import { DataTable } from "@/components/business/data-table";
import { columns } from "@/components/business/columns";
import { ImportButton } from "@/components/business/import-button";
import { AddBusinessSheet } from "@/components/business/add-business-sheet";

// Metadata needs to be moved to a separate layout file when using client components
export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBusinessSheet, setShowAddBusinessSheet] = useState(false);

  // Fetch businesses on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getAllBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
        toast.error("Failed to load businesses");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Function to refresh businesses data
  const refreshBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Businesses", isCurrentPage: true },
        ]}
      />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Bedrifter</h1>
          <div className="flex gap-2">
            <ImportButton />
            <Button onClick={() => setShowAddBusinessSheet(true)}>
              <Plus className="mr-2 h-4 w-4" /> Legg til bedrift
            </Button>
          </div>
        </div>

        <div className="">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Laster bedrifter...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={businesses} />
          )}
        </div>
      </div>

      {/* Add Business Sheet */}
      <AddBusinessSheet
        open={showAddBusinessSheet}
        onOpenChange={setShowAddBusinessSheet}
        onBusinessAdded={refreshBusinesses}
      />
    </>
  );
}

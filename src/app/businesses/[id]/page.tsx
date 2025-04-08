import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Link as LinkIcon,
  Globe,
  CircleDollarSign,
  Users,
  MapPin,
  Check,
  Briefcase,
  MoreHorizontal,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBusinessById } from "@/app/actions/businesses/actions";
import { ModifiedBusinessTabs } from "@/components/business/modified-business-tabs";
import { CustomerStage } from "@prisma/client";
import { formatDistanceToNow, format } from "date-fns";
import { nb } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";

interface BusinessDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function BusinessDetailsPage({
  params,
}: BusinessDetailsPageProps) {
  const businessId = params.id;
  const business = await getBusinessById(businessId);

  if (!business) {
    return notFound();
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "dd.MM.yyyy", { locale: nb });
  };

  const formatRelativeDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return formatDistanceToNow(new Date(date), {
      locale: nb,
      addSuffix: false,
    });
  };

  const formatCurrency = (amount: number, currency: string = "NOK") => {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Find primary contact if exists
  const primaryContact = business.contacts.find((contact) => contact.isPrimary);

  // Format company data
  const companyLink = business.website
    ? business.website.startsWith("http")
      ? business.website
      : `https://${business.website}`
    : null;

  const linkedinUrl = `https://linkedin.com/company/${business.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { label: "Dashbord", href: "/" },
          { label: "Bedrifter", href: "/businesses" },
          { label: business.name || "Bedriftsdetaljer", isCurrentPage: true },
        ]}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Metadata */}
        <div className="w-1/3 border-r bg-background overflow-y-auto p-0">
          <div className="px-4 py-4 flex flex-col h-full">
            {/* Business Icon and Name */}
            <div className="flex flex-col items-center mb-6 pt-4">
              <div className="bg-zinc-900 p-5 rounded-md mb-3 w-[72px] h-[72px] flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-xl font-medium">{business.name}</h1>
              <p className="text-sm text-muted-foreground">
                Lagt til for {formatRelativeDate(business.createdAt)} siden
              </p>
            </div>

            <Separator className="mb-4" />

            {/* Core Metadata - Using the simple format from the image */}
            <div className="space-y-0 mb-6">
              <MetadataItem
                label="URL"
                value={
                  business.website ? (
                    <div className="bg-muted/30 rounded-md px-3 py-1">
                      {business.website}
                    </div>
                  ) : (
                    "-"
                  )
                }
                icon={<LinkIcon className="h-4 w-4" />}
              />

              <MetadataItem
                label="Kontoansvarlig"
                value={
                  business.accountManager ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${business.accountManager}&background=random`}
                          alt={business.accountManager}
                          className="w-5 h-5 rounded-full"
                        />
                      </div>
                      {business.accountManager}
                    </div>
                  ) : (
                    "-"
                  )
                }
                icon={<Users className="h-4 w-4" />}
              />

              <MetadataItem
                label="ICP"
                value={
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    <span>
                      {business.customerSegment === "ICP" ? "Sann" : "Falsk"}
                    </span>
                  </div>
                }
                icon={<Check className="h-4 w-4" />}
              />

              <MetadataItem
                label="Omsetning"
                value={
                  business.revenue ? (
                    <div className="bg-muted/30 rounded-md px-3 py-1">
                      {formatCurrency(business.revenue)}
                    </div>
                  ) : (
                    "-"
                  )
                }
                icon={<CircleDollarSign className="h-4 w-4" />}
              />

              <MetadataItem
                label="LinkedIn"
                value={
                  <div className="bg-muted/30 rounded-md px-3 py-1 truncate max-w-[180px]">
                    linkedin.com/company/
                    {business.name.toLowerCase().replace(/\s+/g, "-")}
                  </div>
                }
                icon={<LinkIcon className="h-4 w-4" />}
              />

              {business.orgNumber && (
                <MetadataItem
                  label="Org.nummer"
                  value={
                    <div className="bg-muted/30 rounded-md px-3 py-1">
                      {business.orgNumber}
                    </div>
                  }
                  icon={<CircleDollarSign className="h-4 w-4" />}
                />
              )}

              <div className="py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground w-full justify-start px-2"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Mer
                </Button>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Holdings - Like in the image */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Eierskap</h3>
              <div className="space-y-2">
                {business.tags &&
                business.tags.some((tag) => tag.name.includes("Holding")) ? (
                  business.tags
                    .filter((tag) => tag.name.includes("Holding"))
                    .map((tag) => (
                      <div key={tag.id} className="flex items-center px-2 py-1">
                        <div className="h-5 w-5 rounded bg-blue-600 mr-2 flex items-center justify-center text-white text-xs">
                          {tag.name.charAt(0)}
                        </div>
                        <span>{tag.name}</span>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center px-2 py-1 text-muted-foreground">
                    <span>Ingen eierskap funnet</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Opportunities - Like in the image */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Muligheter</h3>
              <div className="space-y-2">
                {business.stage === "lead" ||
                business.stage === "prospect" ||
                business.stage === "qualified" ? (
                  <div className="flex items-center px-2 py-1">
                    <div className="h-5 w-5 rounded bg-zinc-900 mr-2 flex items-center justify-center text-white text-xs">
                      {business.name.charAt(0)}
                    </div>
                    <span>{business.name}</span>
                    {business.stage && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {business.stage === "lead"
                          ? "Lead"
                          : business.stage === "prospect"
                          ? "Prospekt"
                          : business.stage === "qualified"
                          ? "Kvalifisert"
                          : ""}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center px-2 py-1 text-muted-foreground">
                    <span>Ingen aktive muligheter</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* People section - Like in the image */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Personer{" "}
                {business.contacts.length > 0 && (
                  <span className="text-muted-foreground text-xs">
                    Alle ({business.contacts.length})
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {business.contacts.length > 0 ? (
                  business.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center px-2 py-1"
                    >
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-2 text-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <span>{contact.name}</span>
                      {contact.isPrimary && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Primær
                        </Badge>
                      )}
                      {contact.position && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({contact.position})
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center px-2 py-1 text-muted-foreground">
                    <span>Ingen kontakter funnet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Tabbed Content */}
        <div className="w-2/3 flex flex-col overflow-hidden">
          <Suspense
            fallback={
              <div className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </div>
            }
          >
            <div className="flex-1 overflow-y-auto">
              <ModifiedBusinessTabs business={business} />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Simple metadata item component to match the image style
function MetadataItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center text-sm">
        {icon}
        <span className="ml-2 text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

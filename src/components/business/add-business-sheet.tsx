"use client";

import { useState, KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Search } from "lucide-react";
import { Prisma } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { searchOrganization } from "@/lib/search-organization";
import { createBusiness } from "@/app/actions/businesses/actions";
import { BusinessStatus, CustomerStage } from "@prisma/client";
import type { CreateBusinessInput } from "@/lib/services/business-service";

// Function to format text from ALL CAPS to Title Case
function formatName(name: string): string {
  if (!name) return "";

  // If all caps, convert to Title Case
  if (name === name.toUpperCase()) {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return name;
}

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Bedriftsnavn er påkrevd" }),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Norge"),
  email: z.string().email({ message: "Ugyldig e-postadresse" }).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  stage: z.nativeEnum(CustomerStage).default(CustomerStage.lead),
});

interface AddBusinessSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessAdded?: () => void;
}

export function AddBusinessSheet({
  open,
  onOpenChange,
  onBusinessAdded,
}: AddBusinessSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      name: string;
      orgnr: string;
      address: string;
      zip: string;
      city: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      orgNumber: "",
      address: "",
      postalCode: "",
      city: "",
      country: "Norge",
      email: "",
      phone: "",
      website: "",
      stage: CustomerStage.lead,
    },
  });

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const result = await searchOrganization(searchQuery);

      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        toast.error("Kunne ikke finne bedriften");
      }
    } catch (error) {
      console.error("Error searching organization:", error);
      toast.error("Feil ved søk etter bedrift");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle selecting a business from search results
  const handleSelectBusiness = (business: {
    name: string;
    orgnr: string;
    address: string;
    zip: string;
    city: string;
  }) => {
    form.setValue("name", formatName(business.name));
    form.setValue("orgNumber", business.orgnr);
    form.setValue("address", business.address);
    form.setValue("postalCode", business.zip);
    form.setValue("city", business.city);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // The workspace will be handled server-side in the createBusiness function
      // using the current user's workspace
      const businessData: Prisma.BusinessCreateInput = {
        name: values.name,
        orgNumber: values.orgNumber || undefined,
        address: values.address || undefined,
        postalCode: values.postalCode || undefined,
        city: values.city || undefined,
        country: values.country,
        email: values.email || "info@example.com",
        phone: values.phone || "00000000",
        stage: values.stage,
        status: BusinessStatus.active,
        workspace: {
          connect: { id: "" },
        },
      };

      await createBusiness(businessData);

      toast.success("Bedrift lagt til");
      form.reset();
      onOpenChange(false);
      if (onBusinessAdded) {
        onBusinessAdded();
      }
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Kunne ikke legge til bedrift");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Legg til bedrift</SheetTitle>
          <SheetDescription>
            Fyll inn informasjon om bedriften eller søk etter eksisterende
            bedrift.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search section */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Søk etter bedrift
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Søk etter navn eller org.nummer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Søk
              </Button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="border rounded-md p-2 space-y-2">
              <h3 className="text-sm font-medium">Søkeresultater</h3>
              <div className="divide-y">
                {searchResults.map((business) => (
                  <div
                    key={business.orgnr}
                    className="py-2 cursor-pointer hover:bg-muted px-2 rounded-md"
                    onClick={() => handleSelectBusiness(business)}
                  >
                    <div className="font-medium">
                      {formatName(business.name)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Org.nr: {business.orgnr}
                    </div>
                    {business.address && (
                      <div className="text-sm text-muted-foreground">
                        {business.address}, {business.zip} {business.city}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedriftsnavn*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orgNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisasjonsnummer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postnummer</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poststed</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="info@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="00000000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Kundestatus</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Velg kundestatus" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CustomerStage.lead}>Lead</SelectItem>
                        <SelectItem value={CustomerStage.prospect}>
                          Prospect
                        </SelectItem>
                        <SelectItem value={CustomerStage.qualified}>
                          Kvalifisert
                        </SelectItem>
                        <SelectItem value={CustomerStage.offer_sent}>
                          Tilbud sendt
                        </SelectItem>
                        <SelectItem value={CustomerStage.offer_accepted}>
                          Tilbud akseptert
                        </SelectItem>
                        <SelectItem value={CustomerStage.customer}>
                          Kunde
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Legg til bedrift
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

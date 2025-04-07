"use server";

interface BrregResponse {
  _embedded: {
    enheter: Array<{
      organisasjonsnummer: string;
      navn: string;
      forretningsadresse?: {
        adresse?: string[];
        postnummer?: string;
        poststed?: string;
      };
    }>;
  };
  page: {
    totalElements: number;
  };
}

export async function searchOrganization(query: string) {
  try {
    // If it's a 9-digit number, search by orgnr
    if (/^\d{9}$/.test(query)) {
      const response = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter/${query}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Organization not found");
      }

      const data = await response.json();
      return {
        success: true,
        data: [
          {
            name: data.navn,
            orgnr: data.organisasjonsnummer,
            address: data.forretningsadresse?.adresse?.[0] || "",
            zip: data.forretningsadresse?.postnummer || "",
            city: data.forretningsadresse?.poststed || "",
          },
        ],
      };
    }

    // Otherwise search by name
    const response = await fetch(
      `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(
        query
      )}&size=10`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search organizations");
    }

    const data: BrregResponse = await response.json();

    return {
      success: true,
      data: data._embedded.enheter.map((org) => ({
        name: org.navn,
        orgnr: org.organisasjonsnummer,
        address: org.forretningsadresse?.adresse?.[0] || "",
        zip: org.forretningsadresse?.postnummer || "",
        city: org.forretningsadresse?.poststed || "",
      })),
    };
  } catch (error) {
    console.error("Error searching organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to search organization",
    };
  }
}

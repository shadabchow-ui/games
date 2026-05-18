import Grid from "components/grid";
import { CompanyCard, CompanyCardData } from "./company-card";

export function CompanyGrid({ companies }: { companies: CompanyCardData[] }) {
  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {companies.map((company) => (
        <Grid.Item className="aspect-auto animate-fadeIn" key={company.id}>
          <CompanyCard company={company} />
        </Grid.Item>
      ))}
    </Grid>
  );
}

import { Card } from "@/components/ui/card";

export function CemeteryFeesSection() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Cemetery Fees and Charges
      </h2>
      <p className="text-muted-foreground mb-4">
        Fees, payments and sums are fixed under section 15 (1) of the Local Authorities
        Cemeteries Orders 1977 – to take effect from the 1st April 2024
      </p>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#33C3F0]">Graves for which NO Exclusive Right of Burial has been granted</h3>
          <div className="space-y-2">
            <p className="text-muted-foreground">For the burial of the body of:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>A child in the Forget Me Not Garden <span className="font-semibold">No charge</span></li>
              <li>A stillborn child or child whose age at the time of death did not exceed 16 years (in an unpurchased grave) <span className="font-semibold">No charge</span></li>
              <li>Child from outside of East Staffordshire <span className="font-semibold">£48.00</span></li>
              <li>A person whose age at the time of death exceeded 16 years <span className="font-semibold">£792.00</span></li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#33C3F0]">Graves for which an EXCLUSIVE RIGHT OF BURIAL has been granted</h3>
          <div className="space-y-2">
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Purchase of Exclusive Right of Burial <span className="font-semibold">£1,245.00</span></li>
              <li>Purchase of Exclusive Right of Burial for cremated remains <span className="font-semibold">£433.00</span></li>
            </ul>
            
            <p className="mt-4 text-muted-foreground">Plus for the burial of:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>A stillborn child or a child whose age at the time of death did not exceed 16 years <span className="font-semibold">No charge</span></li>
              <li>Child from outside of East Staffordshire <span className="font-semibold">£48.00</span></li>
              <li>A person whose age at the time of death exceeded 16 years <span className="font-semibold">£792.00</span></li>
              <li>Additional cost for bricked grave <span className="font-semibold">£219.00</span></li>
              <li>Burial of cremated remains <span className="font-semibold">£219.00</span></li>
              <li>Admin charge for multiple interments <span className="font-semibold">£54.00</span></li>
            </ul>
          </div>
        </section>
      </div>
    </Card>
  );
}
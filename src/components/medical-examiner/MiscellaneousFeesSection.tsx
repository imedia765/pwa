import { Card } from "@/components/ui/card";

export function MiscellaneousFeesSection() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Additional Fees and Information
      </h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#33C3F0]">Miscellaneous</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Transfer of ownership of Exclusive Right of Burial <span className="font-semibold">£57.00</span></li>
            <li>Slabbing or sealing a grave <span className="font-semibold">£168.00</span></li>
            <li>Preparation for the exhumation of a body (administration costs) <span className="font-semibold">£1,265.00</span></li>
            <li>Fees for searches of Registers including copy of entry <span className="font-semibold">£26.00</span></li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#33C3F0]">Monuments, Gravestones, Tablets & Monumental Inscriptions</h3>
          <p className="font-semibold mb-2 text-muted-foreground">PERMIT CHARGES</p>
          <p className="mb-2 text-muted-foreground">For the right to place on a grave for which the Exclusive Right of Burial has been granted:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>A gravestone, cross, book or scroll not to exceed: 1,350mm in height, 914mm in width, 460mm front to back <span className="font-semibold">£378.00</span></li>
            <li>The sizes for the cremated remains section not to exceed: 610mm in height, 610mm in width, 460mm front to back <span className="font-semibold">£378.00</span></li>
            <li>A vase (unless incorporated in a memorial) <span className="font-semibold">£94.00</span></li>
            <li>For each inscription after the first <span className="font-semibold">£122.00</span></li>
            <li>The Forget-Me-Not Memorial <span className="font-semibold">£60.00</span></li>
            <li>The Forget-Me-Not Vase <span className="font-semibold">£48.00</span></li>
            <li>The Forget Me Not Plaque: double (incl. VAT) <span className="font-semibold">£227.00</span></li>
            <li>Kerb memorial <span className="font-semibold">£889.00</span></li>
            <li>Full kerbset (kerbs & headstone) <span className="font-semibold">£1,267.00</span></li>
            <li>Memorial replacement fee <span className="font-semibold">£120.00</span></li>
          </ul>
        </section>
      </div>
    </Card>
  );
}
import { Checkbox } from "@/components/ui/checkbox";

export const MembershipSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Membership Information</h3>
      <div className="space-y-2">
        <h4 className="font-medium">Membership Fee</h4>
        <p>Registration fee: £150</p>
        <p>Annual fee: £40 (collected £20 in January and £20 in June)</p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="giftAid" />
        <label htmlFor="giftAid">I am eligible for Gift Aid</label>
      </div>
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" required />
          <label htmlFor="terms" className="text-sm">
            I/We Hereby confirm the above details provided are genuine and valid. I/We also understand
            that submitting an application or making payment does not obligate PWA Burton On Trent to
            grant Membership. Membership will only be approved once all criteria are met, Supporting
            documents presented, Payment made in Full and approval is informed by the Management of PWA
            Burton On Trent. I/We understand and agree that it is my/our duty and responsibility to
            notify PWA Burton On Trent of ALL changes in circumstance in relation to myself/ALL those
            under this Membership, at my/our earliest convenience.
          </label>
        </div>
      </div>
    </div>
  );
};
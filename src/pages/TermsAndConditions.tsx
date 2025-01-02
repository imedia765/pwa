import React from "react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-[#1a1f2c] text-white py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-[#4a9eed] hover:text-[#3a8edd] mb-4 inline-block">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-[#4a9eed] mb-6">Terms and Conditions</h1>
        <p className="text-gray-300 mb-4">Version 4 - December 2024</p>
        
        <h2 className="text-2xl font-semibold text-[#4a9eed] mb-4">Pakistan Welfare Association</h2>
        <p className="text-gray-300 mb-8">Burton Upon Trent</p>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">1. Members Eligibility</h3>
            <p className="text-gray-300">Only Muslims can be members of Pakistan Welfare Association (PWA).</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">2. Membership Fee</h3>
            <p className="text-gray-300">Any new members must pay a membership fee plus the collection amount for that calendar year. Currently the membership fee is £150 as of January 2024. This may change with inflation and is reviewed periodically to reflect the costs incurred.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">3. Dependents Registration</h3>
            <p className="text-gray-300">All members will be given a membership number and will need to register their dependents so that the PWA Committee can gain an accurate picture of the actual number of people covered. Dependents include stepchildren and adopted children.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">4. Health Declaration</h3>
            <p className="text-gray-300">New members must be in good health, with no known terminal illnesses. Any long-term illnesses must be disclosed to the Committee for consideration during the membership process.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">5. Confidentiality</h3>
            <p className="text-gray-300">All data is confidentially stored under GDPR rules and will not be shared except for necessary processes when death occurs or for use within PWA.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">6. Payment Terms</h3>
            <p className="text-gray-300">Payments will need to be made within 28 days from collection date. This will take place annually from 1st January and no later than 29th January. Any non-paying members will have a warning, and have seven days to make payment which is up until 5th February, in this seven day period they are not covered as members and nor are their dependents.</p>
            <p className="text-gray-300">Any further nonpayment will result in cancellation of membership, and will have to re-register as a member, and must pay a new membership fee of £150. All costs are reviewed periodically to reflect inflation, changes will be communicated to members via their Collector Members or directly through a communication mechanism.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">7. Registration Requirements</h3>
            <p className="text-gray-300">Every married man will need to ensure they are registered separately from their parents or guardian.</p>
            <p className="text-gray-300">Every young male over the age of 18 must have membership in the association regardless to the fact they are employed/unemployed or disabled except for being in full time education until their 22nd birthday. No membership charges will apply to migrating members up until their 23rd birthday, where a new membership charge is applicable. Apprenticeships do not count as being in education.</p>
            <p className="text-gray-300">As and when a members child leaves full time education, they must also register as an individual member. Membership migrated from an existing member does not require to pay membership fees. An adult relative wanting to join, who has never been a member before must follow No 2 above.</p>
            <p className="text-gray-300">Any young person who is 22 years of age or over and attends university must still ensure they are registered as members and not automatically assume they have been migrated into a membership.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">8. Special Cases</h3>
            <p className="text-gray-300">Unmarried females are not obliged to become members as they will have their membership as part of their parents until they are married following which they will be covered under their husband's membership if he is a member. Therefore, females must not assume they are automatically covered after marriage and must ensure their husband is a member to be covered.</p>
            <p className="text-gray-300">If a marriage separation occurs (both live separately) or divorced, with or without children, females and males must have separate memberships.</p>
            <p className="text-gray-300">Any lady who is separated from her husband and living with her parents will need to apply as a separate member and pay fees accordingly.</p>
            <p className="text-gray-300">Any widowed lady will be considered as the head of the family, and she will still need to ensure her fees are paid regularly regardless to the fact she has children or not.</p>
            <p className="text-gray-300">Any male with an additional wife, or wives, must explicitly register their dependants so they are covered. Each additional wife will require additional membership regardless of offspring.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">9. Assistance Offered</h3>
            <p className="text-gray-300">If a head member of family passes away, a £500 payment is offered to the widow, or orphans under the age of 18 only, in this circumstance if death occurs in Pakistan £1,000 is offered. This is subject to review of the committee to reflect changes in inflation.</p>
            <p className="text-gray-300">PWA will cover costs for both viable and non-viable foetus.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">10. Residency Requirements</h3>
            <p className="text-gray-300">Any member who must live out of East Staffordshire Borough Council (ESBC) for work will still receive full benefits of the association. This will be determined by where you are registered for Council Tax or can prove you are an ESBC resident.</p>
            <p className="text-gray-300">It is advisable for members to be able to prove ESBC residency, such as be on the electoral roll in ESBC or bank statements and proof of address. If you are unable to prove being an ESBC resident may make you liable for triple costs of burial currently set by ESBC, which is on the ESBC website under burial fees and is subject to change at the council's discretion. PWA will only cover the first set of fees which is the cost for being a ESBC resident.</p>
            <p className="text-gray-300">Any member who moves out of ESBC who are legacy members (pre-2024), will be covered to the costs of the average cost of the last 4 burials, all other costs will be the responsibility of the deceased family. Any members who joined after 2024 will not be covered if they have moved out of ESBC boundaries as defined by the council and will no longer be members of PWA.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">11. Visitor Membership</h3>
            <p className="text-gray-300">Any visitors of members of the association from other countries will be able to apply for membership for the duration of the temporary stay at a fixed rate of £50 plus last collection, which is non-refundable. As and when a collection is decided on from all members the visitor must also pay their contribution. If the visitor's status changes, then the visitor must become a new member as per the above guidance. The earlier fee paid will then be deducted from the new membership fee.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">12. Repatriation Costs</h3>
            <p className="text-gray-300">Where there are circumstances of repatriation to a foreign country, the maximum costs paid are the average of the last 4 UK burials. Cargo costs vary from airlines and can be substantial and fluctuate and are no longer free as previously offered by PIA. The responsibility of costs is up until delivery to any airport in England, any delays or lost cargo are solely the responsibility of the deceased family.</p>
            <p className="text-gray-300">Where there are circumstances of repatriation back to the UK, where the body is being brought back for burial. The Association is responsible for collection from any airport in England, all costs incurred before this is the responsibility of the deceased family.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">13. Financial Buffer</h3>
            <p className="text-gray-300">There should be a buffer amount of collected funds in the bank account for the equivalent amount to the cost of 4 deaths, currently amounting to £16,000, in the PWA bank account. Anything below this should trigger a new collection. This is to cover the immediate costs should there be an unforeseen tragedy within one family.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">14. Funeral Arrangements</h3>
            <p className="text-gray-300">Family members may want to use other funeral providers and may make extra arrangements for funeral services, this extra cost is the responsibility of the family, PWA will only pay the sum of the usual costs from providers used from their preferred/regular funeral provider.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-[#4a9eed] mb-4">15. Committee Changes</h3>
            <p className="text-gray-300">Any changes to payments made, or rule changes must be voted in within the Committee. This should be communicated to other collector members, and then a wider communication made to members.</p>
          </section>

          <footer className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-300 mb-4">By becoming a member of the Pakistan Welfare Association, you agree to abide by these terms and conditions outlined above.</p>
            <p className="text-gray-400">© 2024 Pakistan Welfare Association. All rights reserved.</p>
            <p className="text-gray-400">© 2024 SmartFIX Tech, Burton Upon Trent. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

import React from "react";
import { Link } from "react-router-dom";

const CollectorResponsibilities = () => {
  return (
    <div className="min-h-screen bg-[#1a1f2c] text-white py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/" className="text-[#4a9eed] hover:text-[#3a8edd] mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-[#4a9eed] mb-8">PWA Collector Member Responsibilities</h1>
        
        <div className="bg-gradient-to-br from-[#1e2430] to-[#252b3b] p-8 rounded-xl shadow-lg border border-[#2a3040] space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-[#4a9eed] mb-4">Overview</h2>
            <p className="text-gray-300">
              A Collector member is a senior member of the PWA who is responsible for a specific number of paying members who are part of the death committee.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#4a9eed] mb-4">Collector Responsibilities</h2>
            <ul className="list-none space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Act as the representative of the death committee for each member on their list.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Act as first point of contact for any enquiries from members or prospective members.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Register new members with the death committee.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Communicate announcements from death committee to members.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Collect member's fees whenever a collection is due.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Keep a record of all members' payments made into PWA bank account, including:</span>
              </li>
              <li className="ml-8 space-y-2">
                <p>• Date paid</p>
                <p>• Reference used</p>
                <p>• Bank account name</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>When consolidating collection with treasurer, share record/evidence of online payments if requested.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Act as conduit between the members and death committee Senior Leadership Team (SLT) for any day-to-day issues.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Attending Collectors meetings with other members.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Provide guidance to new members and prospective members seeking membership with the PWA.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-[#4a9eed] mt-1">•</span>
                <span>Feedback any issues or concerns to the PWA SLT.</span>
              </li>
            </ul>
          </section>

          <p className="text-gray-300 mt-8">
            As a Collector Member, you play a crucial role in the smooth operation and communication within the Pakistan Welfare Association.
          </p>

          <footer className="mt-12 pt-8 border-t border-[#2a3040] text-sm text-gray-400">
            <p>© 2024 Pakistan Welfare Association. All rights reserved.</p>
            <p>© 2024 SmartFIX Tech, Burton Upon Trent. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CollectorResponsibilities;
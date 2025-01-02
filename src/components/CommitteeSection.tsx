import React from "react";

const CommitteeMember = ({ name, role }: { name: string; role: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-primary mb-2">{name}</h3>
    <p className="text-gray-600">{role}</p>
  </div>
);

export const CommitteeSection = () => {
  const members = [
    { name: "Anjum Riaz & Habib Mushtaq", role: "Chairperson" },
    { name: "Tariq Majid", role: "Secretary" },
    { name: "Faizan Qadiri", role: "Treasurer" },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          New Committee as of December 2023
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {members.map((member) => (
            <CommitteeMember key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};
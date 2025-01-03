interface CollectorMemberInfoProps {
  memberNumber: string | null;
}

const CollectorMemberInfo = ({ memberNumber }: CollectorMemberInfoProps) => {
  if (!memberNumber) {
    return <span className="text-sm text-yellow-400">(Not a member)</span>;
  }

  return (
    <span className="text-sm text-purple-400">
      (Member #{memberNumber})
    </span>
  );
};

export default CollectorMemberInfo;
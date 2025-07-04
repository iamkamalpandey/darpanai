export const StageBadge = ({
  counsellorStatus,
  profileStatus,
}: {
  counsellorStatus: boolean;
  profileStatus: string;
}) => {
  let stageInfo = {
    text: "Telecalling",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  };

  if (counsellorStatus) {
    stageInfo = {
      text: "Admission",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    };
  } else if (!counsellorStatus && profileStatus === "complete") {
    stageInfo = {
      text: "Counsellor",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    };
  }

  return (
    <div
      className={`${stageInfo.bgColor} ${stageInfo.textColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}
    >
      {stageInfo.text}
    </div>
  );
};

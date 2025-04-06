import StatusButton from "./StatusButton";

const UserCard = ({ user, changeUserStatus }) => {
  const statusButtons = [
    { status: "regular", icon: "/regular.svg" },
    { status: "family", icon: "/family.svg" },
    { status: "developer", icon: "/developer.svg" },
    { status: "admin", icon: "/admin.svg" },
  ];

  return (
    <div className="w-full border border-white bg-indigo-500 h-[100px] p-3 rounded-lg relative mt-5">
      <p>{user.email}</p>
      <div className="absolute bottom-3 left-3 flex gap-2">
        {statusButtons.map((button) => (
          <StatusButton
            key={button.status}
            status={button.status}
            currentStatus={user.status}
            icon={button.icon}
            onClick={() => changeUserStatus(user.id, button.status)}
          />
        ))}
      </div>
    </div>
  );
};

export default UserCard;

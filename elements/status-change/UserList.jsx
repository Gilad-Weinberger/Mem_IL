import UserCard from "./UserCard";

const UserList = ({ users, changeUserStatus, usersLoading, usersError }) => {
  if (usersLoading) {
    return <div className="text-white text-center mt-20">טוען משתמשים...</div>;
  }

  if (usersError) {
    return (
      <div className="text-white text-center mt-20">
        שגיאה בטעינת המשתמשים: {usersError}
      </div>
    );
  }

  return (
    <div className="gap-3 mt-5">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          changeUserStatus={changeUserStatus}
        />
      ))}
    </div>
  );
};

export default UserList;

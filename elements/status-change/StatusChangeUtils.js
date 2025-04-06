import { updateObject } from "@/lib/functions/dbFunctions";

export const handleStatusChange = async (
  userId,
  newStatus,
  users,
  setUsers
) => {
  const selectedUser = users.find((user) => user.id === userId);
  if (selectedUser?.status === newStatus) return;

  const confirmChange = window.confirm(
    `Are you sure you want to change this user:\nemail: ${selectedUser.email}\nstatus to "${newStatus}"?`
  );

  if (!confirmChange) return;

  try {
    await updateObject("users", userId, { status: newStatus });
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  } catch (error) {
    console.error("Error updating user status:", error);
  }
};

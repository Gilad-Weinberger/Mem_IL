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
    `האם אתה בטוח שברצונך לשנות את הסטטוס של המשתמש:\nemail: ${selectedUser.email}\nלסטטוס "${newStatus}"?`
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
    alert("שגיאה בעדכון סטטוס המשתמש");
  }
};

import { updateObject, getObjectsByField } from "@/lib/functions/dbFunctions";

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
    // Update user status in users collection
    await updateObject("users", userId, { status: newStatus });

    // Update corresponding status request if it exists
    const statusRequests = await getObjectsByField(
      "statusRequests",
      "userId",
      userId
    );
    if (statusRequests.length > 0) {
      // Find the most recent pending request
      const pendingRequest = statusRequests
        .filter((request) => request.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (pendingRequest) {
        // Update the status request to approved
        await updateObject("statusRequests", pendingRequest.id, {
          status: "approved",
          approvedAt: new Date().toISOString(),
        });
      }
    }

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

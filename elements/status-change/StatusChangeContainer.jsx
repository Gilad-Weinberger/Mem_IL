import { useState, useEffect } from "react";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "./SearchBar";
import UserList from "./UserList";
import { handleStatusChange } from "./StatusChangeUtils";

const StatusChangeContainer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserStatus(userData?.status || null);
          }
        } catch (err) {
          console.error("Error fetching user document:", err);
          setError("Failed to fetch user data.");
        }
      } else {
        setUser(null);
        router.push("/signin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && userStatus === "admin") {
      setUsersLoading(true);
      const unsubscribe = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const usersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersData);
          setUsersLoading(false);
        },
        (error) => {
          console.error("Error fetching users:", error);
          setUsersError("Failed to load users.");
          setUsersLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, userStatus]);

  const changeUserStatus = (userId, newStatus) => {
    handleStatusChange(userId, newStatus, users, setUsers);
  };

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  if (userStatus !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">אין לך הרשאה לגשת לעמוד זה</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <p className="text-xl">צריך להתחבר על מנת לגשת לעמוד זה</p>
      </div>
    );
  }

  return (
    <div
      className="bg-black w-full pt-14 p-5 min-h-screen h-full text-white"
      dir="rtl"
    >
      <Navbar />
      <div className="h-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="text-center w-full mt-6">
          <p className="text-2xl md:text-3xl font-semibold">רשימת משתמשים</p>
          <hr className="w-full mt-2 border-gray-500" />
        </div>
        <UserList
          users={filteredUsers}
          changeUserStatus={changeUserStatus}
          usersLoading={usersLoading}
          usersError={usersError}
        />
      </div>
      <Footer />
    </div>
  );
};

export default StatusChangeContainer;

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const logout = async () => {
  try {
    await signOut(auth);
    // Clear user data from session storage
    sessionStorage.removeItem("user");
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export default logout;

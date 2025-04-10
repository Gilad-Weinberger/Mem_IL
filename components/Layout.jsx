import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <div className="text-white text-center mt-20">טוען...</div>;
  }

  return (
    <div className="min-h-screen md:mr-16">
      <div className="md:flex md:flex-row">{children}</div>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen md:mr-16">
      <div className="md:flex md:flex-row">{children}</div>
    </div>
  );
}

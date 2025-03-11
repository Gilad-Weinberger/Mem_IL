export async function generateMetadata({ params }) {
  return {
    title: `ארכיון החיילים | לזכרם`,
    description: "לזכר הנופלים",
  };
}

export default function Layout({ children }) {
  return children;
}

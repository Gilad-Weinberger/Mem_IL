export async function generateMetadata({ params }) {
  return {
    title: `חילוץ מידע חייל | לזכרם`,
    description: "חילוץ מידע אודות חיילים שנפלו",
  };
}

export default function Layout({ children }) {
  return children;
}

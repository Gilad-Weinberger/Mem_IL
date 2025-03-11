import { getObject } from "@/lib/functions/dbFunctions";

export async function generateMetadata({ params }) {
  const soldier = await getObject("soldiers", params.id);

  if (!soldier) {
    return {
      title: "חייל לא נמצא",
      description: "הדף המבוקש לא נמצא",
    };
  }

  return {
    title: `${soldier.name} | לזכרם`,
    description: soldier.lifeStory?.substring(0, 160) || "לזכר הנופלים",
  };
}

export default function Layout({ children }) {
  return children;
}

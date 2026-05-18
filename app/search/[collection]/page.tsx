import { redirect } from "next/navigation";

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
}) {
  const params = await props.params;
  redirect(`/search?q=${encodeURIComponent(params.collection)}`);
}

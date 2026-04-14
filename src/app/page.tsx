import { redirect } from "next/navigation";

// Home page redirects to the calendar view
export default function Home() {
  redirect("/calendar");
}

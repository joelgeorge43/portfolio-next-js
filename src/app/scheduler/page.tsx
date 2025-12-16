import { Meta } from "@once-ui-system/core";
import { baseURL } from "@/resources";
import SchedulerClient from "./SchedulerClient";

export async function generateMetadata() {
  return Meta.generate({
    title: "Connect | Joel George",
    description: "Schedule a time to discuss your project.",
    baseURL: baseURL,
    path: "/scheduler",
  });
}

export default function Scheduler() {
  return <SchedulerClient />;
}

import cron from "node-cron";
import { exec } from "child_process";

// Normal schedules
cron.schedule("34 8 * * *", () => {
  console.log("Running blog automation");
  exec("node blog.js");
});

cron.schedule("48 10 * * *", () => {
  console.log("Running blog automation");
  exec("node blog.js");
});

cron.schedule("57 16 * * *", () => {
  console.log("Running blog automation");
  exec("node blog.js");
});

console.log("Scheduler running...");
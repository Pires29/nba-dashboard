import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";

const lockPath = ".next/lock";

const hasLiveNextProcess = () => {
  try {
    const output = execFileSync("ps", ["-eo", "pid=,command="], { encoding: "utf8" });
    const selfPid = String(process.pid);
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .some((line) => {
        const [pid, ...commandParts] = line.split(/\s+/);
        const command = commandParts.join(" ");
        return pid !== selfPid && /\bnext\b/.test(command) && /\b(build|dev)\b/.test(command);
      });
  } catch {
    return false;
  }
};

if (existsSync(lockPath) && !hasLiveNextProcess()) {
  const content = readFileSync(lockPath, "utf8");
  if (content.trim() === "") {
    unlinkSync(lockPath);
    console.log("Removed stale Next.js build lock.");
  }
}

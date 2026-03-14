import { spawnSync } from "node:child_process";
import path from "node:path";

function runTask(args: string[]) {
  const result = spawnSync("schtasks.exe", args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`schtasks 执行失败: ${args.join(" ")}`);
  }
}

function main() {
  const projectDir = process.cwd();
  const npmCmd = path.join(path.dirname(process.execPath), "npm.cmd");
  const syncCommand = `cmd /c cd /d "${projectDir}" && "${npmCmd}" run sync`;
  const webCommand = `cmd /c cd /d "${projectDir}" && "${npmCmd}" run start`;

  runTask([
    "/Create",
    "/F",
    "/SC",
    "HOURLY",
    "/MO",
    "3",
    "/RU",
    "SYSTEM",
    "/RL",
    "HIGHEST",
    "/TN",
    "DoubanReborn Sync",
    "/TR",
    syncCommand,
  ]);

  runTask([
    "/Create",
    "/F",
    "/SC",
    "ONSTART",
    "/RU",
    "SYSTEM",
    "/RL",
    "HIGHEST",
    "/TN",
    "DoubanReborn Web",
    "/TR",
    webCommand,
  ]);

  console.log(`Windows 计划任务已创建，项目目录：${path.resolve(projectDir)}`);
}

main();

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// core/scripts/generate-telegram-session.ts
var import_telegram = require("telegram");
var import_sessions = require("telegram/sessions/index.js");
var import_input = __toESM(require("input"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_child_process = require("child_process");
var API_ID = 36036114;
var API_HASH = "19bd84292c33441170cad1585e7989fc";
function updateEnvFile(filePath, key, value) {
  if (!import_fs.default.existsSync(filePath)) {
    return false;
  }
  try {
    let content = import_fs.default.readFileSync(filePath, "utf8");
    const regex = new RegExp(`^${key}=.*$`, "m");
    const newLine = `${key}="${value}"`;
    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content = content.trimEnd() + "\n" + newLine + "\n";
    }
    import_fs.default.writeFileSync(filePath, content, "utf8");
    console.log(`   \u2713 Injected ${key} into ${filePath}`);
    return true;
  } catch (err) {
    console.error(`   \u274C Failed to write to ${filePath}:`, err);
    return false;
  }
}
async function runSessionGenerator() {
  console.log("\n\u{1F4F1} ================================================================");
  console.log("\u{1F4F1} TELEGRAM MTPROTO USER SESSION GENERATOR (GRAMJS)");
  console.log("\u{1F4F1} ================================================================\n");
  console.log(`\u{1F511} App API ID:   ${API_ID}`);
  console.log(`\u{1F512} App API Hash: ${API_HASH.slice(0, 6)}...${API_HASH.slice(-4)}`);
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  const stringSession = new import_sessions.StringSession("");
  const client = new import_telegram.TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5
  });
  console.log("\n\u{1F680} Initializing connection to Telegram MTProto Gateway...");
  await client.start({
    phoneNumber: async () => {
      const phone2 = await import_input.default.text("\u{1F4DE} \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 (\u0432 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u043E\u043C \u0444\u043E\u0440\u043C\u0430\u0442\u0435, \u043D\u0430\u043F\u0440. +1... \u0438\u043B\u0438 +7...): ");
      return phone2.trim();
    },
    password: async () => {
      const pwd = await import_input.default.password("\u{1F510} \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C \u0434\u0432\u0443\u0445\u0444\u0430\u043A\u0442\u043E\u0440\u043D\u043E\u0439 \u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 (2FA Cloud Password, \u0435\u0441\u043B\u0438 \u0432\u043A\u043B\u044E\u0447\u0435\u043D): ");
      return pwd.trim();
    },
    phoneCode: async () => {
      const code = await import_input.default.text("\u{1F4E9} \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0438\u0437 Telegram: ");
      return code.trim();
    },
    onError: (err) => {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438 MTProto:", err);
    }
  });
  console.log("\n\u2705 \u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430!");
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  const me = await client.getMe();
  const username = me.username ? `@${me.username}` : "(\u0431\u0435\u0437 username)";
  const phone = me.phone ? `+${me.phone}` : "(\u043D\u043E\u043C\u0435\u0440 \u0441\u043A\u0440\u044B\u0442)";
  const name = [me.firstName, me.lastName].filter(Boolean).join(" ") || "Unknown";
  const sessionString = client.session.save();
  console.log("\u{1F464} \u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u043D\u043D\u043E\u0433\u043E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430:");
  console.log(`   \u2022 \u0418\u043C\u044F:        ${name}`);
  console.log(`   \u2022 Username:   ${username}`);
  console.log(`   \u2022 \u0422\u0435\u043B\u0435\u0444\u043E\u043D:    ${phone}`);
  console.log(`   \u2022 User ID:    ${me.id}`);
  console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  console.log("\n\u{1F511} \u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F MTProto StringSession:");
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  console.log(sessionString);
  console.log("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  const envCandidates = [
    "/var/www/affiliate/core/.env",
    "/var/www/affiliate/.env",
    import_path.default.resolve(__dirname, "../.env"),
    import_path.default.resolve(__dirname, "../../.env")
  ];
  console.log("\n\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0441\u0435\u0441\u0441\u0438\u0438 \u0432 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B:");
  const updatedFiles = [];
  for (const envPath of envCandidates) {
    if (import_fs.default.existsSync(envPath)) {
      const ok = updateEnvFile(envPath, "TELEGRAM_USER_SESSION", sessionString);
      if (ok) updatedFiles.push(envPath);
    }
  }
  if (process.platform !== "win32") {
    try {
      (0, import_child_process.execSync)("chmod 600 /var/www/affiliate/core/.env /var/www/affiliate/.env 2>/dev/null || true");
      console.log("   \u2713 \u041F\u0440\u0430\u0432\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u044B: chmod 600 \u043D\u0430 .env \u0444\u0430\u0439\u043B\u044B");
    } catch {
    }
  }
  console.log("\n================================================================");
  console.log("\u{1F389} \u0421\u0415\u0421\u0421\u0418\u042F \u0423\u0421\u041F\u0415\u0428\u041D\u041E \u0421\u041E\u0425\u0420\u0410\u041D\u0415\u041D\u0410 \u0418 \u0413\u041E\u0422\u041E\u0412\u0410 \u041A \u0418\u0421\u041F\u041E\u041B\u042C\u0417\u041E\u0412\u0410\u041D\u0418\u042E \u0412 \u0412\u041E\u0420\u041A\u0415\u0420\u0410\u0425!");
  console.log("================================================================\n");
  await client.disconnect();
  process.exit(0);
}
runSessionGenerator().catch((err) => {
  console.error("\n\u{1F4A5} FATAL ERROR during session generation:", err);
  process.exit(1);
});

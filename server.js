
const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_VERSION = process.env.GRAPH_API_VERSION;

app.get("/", (req, res) => {
  res.send("Hossam Qureo Bot is running!");
});

app.get("/webhook", (req, res) => {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === VERIFY_TOKEN
  ) {
    return res.send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

function reply(text) {
  const t = text.toLowerCase().trim();

  if (["مرحبا", "أهلا", "ابدأ", "القائمة", "menu"].includes(t)) {
    return "🎓 Hossam Qureo Bot\n\nJS - JavaScript\nPY - Python\nFIN - الثقافة المالية\n\nأرسل اسم المادة.";
  }

  if (t === "js" || t === "javascript") {
    return "📘 JavaScript\nlet score = 10;\nconsole.log(score);\n\nالسؤال: ما قيمة score؟\nJS1 = 10\nJS2 = 20";
  }

  if (t === "py" || t === "python") {
    return '🐍 Python\nprint("Hello")\n\nالسؤال: ماذا يظهر؟\nPY1 = Hello\nPY2 = Python';
  }

  if (t === "fin" || t === "ثقافة مالية") {
    return "💰 الثقافة المالية\nالميزانية تساعد على تنظيم الدخل والمصروفات.\n\nFIN1 = تنظيم الدخل والمصروفات\nFIN2 = الإنفاق دون تخطيط";
  }

  const answers = {
    js1: ["صحيح! قيمة score هي 10.", true],
    js2: ["راجع المثال، القيمة هي 10.", false],
    py1: ["صحيح! يظهر Hello.", true],
    py2: ["راجع المثال، يظهر Hello.", false],
    fin1: ["صحيح! الميزانية تنظم الدخل والمصروفات.", true],
    fin2: ["الميزانية تساعد على التخطيط.", false]
  };

  if (answers[t]) {
    return (answers[t][1] ? "✅ " : "❌ ") + answers[t][0] +
      "\nأرسل القائمة لاختيار مادة أخرى.";
  }

  return "لم أفهم رسالتك. أرسل «القائمة» لعرض المواد.";
}

async function sendMessage(to, body) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID || !API_VERSION) {
    console.error("WhatsApp settings are missing.");
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body }
      })
    }
  );

  if (!response.ok) {
    console.error("WhatsApp API error:", await response.text());
  }
}

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  for (const entry of req.body.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        if (message.type === "text" && message.from) {
          await sendMessage(
            message.from,
            reply(message.text?.body || "")
          );
        }
      }
    }
  }
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Hossam Qureo Bot started.");
});
    

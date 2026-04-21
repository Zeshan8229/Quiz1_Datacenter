const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');

// Load .env file if present (local dev). On Render, env vars are set in dashboard.
try { require('dotenv').config(); } catch (_) {}

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Config ──────────────────────────────────────────────────
const EMAIL_ADDRESS  = process.env.EMAIL_ADDRESS  || 'hassanusama284@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';   // Set via environment variable

if (!EMAIL_PASSWORD) {
  console.warn('⚠  WARNING: EMAIL_PASSWORD environment variable is not set. Email sending will fail.');
}

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve the quiz HTML (index.html) at the root
app.use(express.static(path.join(__dirname)));

// ── Nodemailer transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD,
  },
});

// ── Health check (useful for Render to confirm server is up) ─
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Email endpoint ───────────────────────────────────────────
app.post('/send-result', async (req, res) => {
  const {
    name, empId, pct, correct, wrong,
    grade, gradeMsg, datetime, timeTaken,
  } = req.body;

  // Basic input validation
  if (!name || !empId || pct === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  const passed   = pct >= 50;
  const subject  = `DC Training Assessment – ${name} (${empId}) – Score: ${pct}% [${grade}]`;
  const plainText =
    `DC Training Assessment Result – PTCL Group\n` +
    `==========================================\n` +
    `Candidate  : ${name}\n` +
    `Employee ID: ${empId}\n` +
    `Date & Time: ${datetime}\n` +
    `Time Taken : ${timeTaken}\n` +
    `Score      : ${pct}%\n` +
    `Correct    : ${correct} / 100\n` +
    `Incorrect  : ${wrong} / 100\n` +
    `Grade      : ${grade} — ${gradeMsg}\n` +
    `Result     : ${passed ? 'PASSED' : 'FAILED'}\n`;

  const htmlBody = `
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#020c18;color:#e0f4ff;border:1px solid rgba(0,212,255,0.3);border-radius:10px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#004a7c,#006fa6);padding:24px 32px;">
      <h2 style="margin:0;font-size:18px;letter-spacing:2px;color:#fff;">DATA CENTER INFRASTRUCTURE &amp; OPERATIONS</h2>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Assessment Result — PTCL Group</p>
    </div>

    <!-- Result badge -->
    <div style="text-align:center;padding:28px 32px 0;">
      <div style="display:inline-block;padding:10px 36px;border-radius:6px;font-size:22px;font-weight:900;letter-spacing:3px;
                  background:${passed ? 'rgba(0,255,136,0.1)' : 'rgba(255,34,68,0.1)'};
                  border:2px solid ${passed ? '#00ff88' : '#ff2244'};
                  color:${passed ? '#00ff88' : '#ff2244'};">
        ${passed ? '✔ PASSED' : '✘ FAILED'}
      </div>
    </div>

    <!-- Score highlight -->
    <div style="text-align:center;padding:20px 32px 4px;">
      <div style="font-size:56px;font-weight:900;color:#00d4ff;line-height:1;text-shadow:0 0 30px rgba(0,212,255,0.5);">${pct}%</div>
      <div style="font-size:13px;color:#7ab8d4;letter-spacing:2px;margin-top:4px;">OVERALL SCORE</div>
    </div>

    <!-- Grade -->
    <div style="text-align:center;padding:10px 32px 24px;">
      <span style="font-size:28px;font-weight:900;color:#00d4ff;">${grade}</span>
      <span style="font-size:15px;color:#7ab8d4;margin-left:10px;">${gradeMsg}</span>
    </div>

    <!-- Detail table -->
    <div style="padding:0 32px 28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid rgba(0,212,255,0.1);border-radius:8px;overflow:hidden;">
        <tr style="background:rgba(0,212,255,0.06);">
          <td style="padding:10px 16px;color:#7ab8d4;width:45%;">Candidate</td>
          <td style="padding:10px 16px;color:#00ffcc;font-weight:700;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#7ab8d4;">Employee ID</td>
          <td style="padding:10px 16px;color:#00ffcc;font-weight:700;">${empId}</td>
        </tr>
        <tr style="background:rgba(0,212,255,0.06);">
          <td style="padding:10px 16px;color:#7ab8d4;">Date &amp; Time</td>
          <td style="padding:10px 16px;color:#e0f4ff;">${datetime}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#7ab8d4;">Time Taken</td>
          <td style="padding:10px 16px;color:#e0f4ff;">${timeTaken}</td>
        </tr>
        <tr style="background:rgba(0,212,255,0.06);">
          <td style="padding:10px 16px;color:#7ab8d4;">Correct Answers</td>
          <td style="padding:10px 16px;color:#00ff88;font-weight:700;">${correct} / 100</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#7ab8d4;">Incorrect / Skipped</td>
          <td style="padding:10px 16px;color:#ff2244;font-weight:700;">${wrong} / 100</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="background:rgba(0,212,255,0.05);padding:14px 32px;font-size:11px;color:#7ab8d4;text-align:center;border-top:1px solid rgba(0,212,255,0.1);">
      Auto-generated by DC Operations Assessment Portal – PTCL Group
    </div>
  </div>`;

  try {
    await transporter.sendMail({
      from: `"PTCL DC Assessment Portal" <${EMAIL_ADDRESS}>`,
      to: EMAIL_ADDRESS,
      subject,
      html: htmlBody,
      text: plainText,
    });
    res.json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Nodemailer error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ DC Assessment Server running on port ${PORT}`);
  console.log(`   Open the quiz at: http://localhost:${PORT}/\n`);
});

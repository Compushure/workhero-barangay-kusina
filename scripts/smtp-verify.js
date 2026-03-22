#!/usr/bin/env node
/**
 * Lightweight SMTP transport verification for Brevo/Nodemailer.
 * Loads .env.local from project root, creates a transporter, and runs verify().
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_KEY;
const allowSelf = process.env.SMTP_ALLOW_SELF_SIGNED === 'true';

if (!host || !port || !user || !pass) {
  console.error('Missing one of SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_KEY in env');
  process.exit(1);
}

console.log('SMTP verify starting with:');
console.log({
  host,
  port,
  user,
  allowSelf,
  secure: port === 465,
});

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: allowSelf ? { rejectUnauthorized: false } : undefined,
});

transporter.verify((err, success) => {
  if (err) {
    console.error('VERIFY_ERROR:', err && err.message ? err.message : err);
    if (err && err.code) console.error('Code:', err.code);
    if (err && err.response) console.error('Response:', err.response);
    process.exit(1);
  } else {
    console.log('VERIFY_OK:', success);
    process.exit(0);
  }
});

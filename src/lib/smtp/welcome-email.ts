import { readFile } from 'node:fs/promises';
import path from 'node:path';

import nodemailer from 'nodemailer';

//fs/promises → to read the HTML email template file.

// path → to build the template file path.

// nodemailer → to send emails via SMTP.
import type { EmployeeTypeValue } from '@/types';

type WelcomeEmailParams = {
  to: string;
  name: string;
  role: EmployeeTypeValue;
  magicLink: string;
};

const welcomeEmailTemplatePath = path.join(
  process.cwd(),
  'src',
  'components',
  'smtp',
  'email.html'
);

const defaultFromAddress =
  process.env.SMTP_FROM?.trim() || '"Compushure" <tonilegayada@gmail.com>';
const defaultSupportEmail = 'tonilegayada@gmail.com';

let cachedWelcomeEmailTemplate: string | null = null;

// sanitizes strings to prevent HTML injection (replaces <, >, &, etc.).
// safe strings that won’t break HTML or allow malicious scripts.
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
//Ensures required SMTP environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_KEY) are present, otherwise throws an error

function getRequiredEnv(name: 'SMTP_HOST' | 'SMTP_PORT' | 'SMTP_USER' | 'SMTP_KEY'): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
// Replaces placeholders like {{USER_NAME}} in the HTML template with actual values.
function interpolateTemplate(template: string, values: Record<string, string>): string {
  // terates over that array, accumulating a single result string.
//   For each key/value pair:
// Finds all occurrences of {{KEY}} in the template.
// Replaces them with the corresponding value
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  );
}
// Reads and caches the HTML template file (email.html) so it’s only loaded once.
async function loadWelcomeEmailTemplate(): Promise<string> {
  // dynamically creates a email.html in the specified path
  if (cachedWelcomeEmailTemplate) {
    return cachedWelcomeEmailTemplate;
  }

  cachedWelcomeEmailTemplate = await readFile(welcomeEmailTemplatePath, 'utf8');
  return cachedWelcomeEmailTemplate;
}
// Maps internal role values (superadmin, manager, hr, regular) to human‑friendly labels.
export function getRoleLabel(role: EmployeeTypeValue): string {
  switch (role) {
    case 'superadmin':
      return 'Superadmin';
    case 'manager':
      return 'Manager';
    case 'hr':
      return 'HR';
    case 'regular':
    default:
      return 'KusinHero';
  }
}

//eturns the URL path the user should be redirected to after login, based on role.
export function getPostLoginPath(role: EmployeeTypeValue): string {
  switch (role) {
    case 'superadmin':
      return '/admin/manage';
    case 'manager':
      return '/manager/task-assignment';
    case 'hr':
      return '/hr/reward-requests';
    case 'regular':
    default:
      return '/employee/dashboard';
  }
}
//  Provides a descriptive label for the destination page (e.g., “the manager task board”).
function getNextDestinationLabel(role: EmployeeTypeValue): string {
  switch (role) {
    case 'superadmin':
      return 'the admin management dashboard';
    case 'manager':
      return 'the manager task board';
    case 'hr':
      return 'the HR reward requests page';
    case 'regular':
    default:
      return 'the employee dashboard';
  }
}

/*
Loads the HTML template.
Interpolates placeholders with escaped values:
Preview text, user name, role label, magic link, destination, support email, current year.
Produces the HTML version of the welcome email.
*/
async function renderWelcomeEmailTemplate({
  name,
  role,
  magicLink,
}: WelcomeEmailParams): Promise<string> {
  const template = await loadWelcomeEmailTemplate();
  const roleLabel = getRoleLabel(role);
  const nextDestination = getNextDestinationLabel(role);

  return interpolateTemplate(template, {
    PREVIEW_TEXT: escapeHtml(
      `Welcome to Work Hero KusinHero. Your ${roleLabel.toLowerCase()} login link is ready.`
    ),
    USER_NAME: escapeHtml(name),
    ROLE_LABEL: escapeHtml(roleLabel),
    MAGIC_LINK: escapeHtml(magicLink),
    NEXT_DESTINATION: escapeHtml(nextDestination),
    SUPPORT_EMAIL: escapeHtml(process.env.SUPPORT_EMAIL?.trim() || defaultSupportEmail),
    YEAR: String(new Date().getFullYear()),
  });
}
// Constructs a plain‑text fallback email body
function buildWelcomeEmailText({ name, role, magicLink }: WelcomeEmailParams): string {
  const roleLabel = getRoleLabel(role);
  const nextDestination = getNextDestinationLabel(role);
  const supportEmail = process.env.SUPPORT_EMAIL?.trim() || defaultSupportEmail;

  return [
    `Welcome ${name}!`,
    '',
    `You've been added as a ${roleLabel} to Work Hero Barangay Kusina.`,
    'To log in for the first time, use your magic link below:',
    magicLink,
    '',
    `This link will sign you in and send you to ${nextDestination}.`,
    'Your password will be handed out to you by the Admin User.',
    `Need help? Contact ${supportEmail}.`,
    '',
    "Let's get cooking, KusinHero!",
  ].join('\n');
}
// send mail using selected smtp provider
// check DOCUMENTTION OF USING BREOVO  with nodemailer 
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const smtpPort = Number(getRequiredEnv('SMTP_PORT'));

  if (Number.isNaN(smtpPort)) {
    throw new Error('SMTP_PORT must be a valid number');
  }

  const allowSelfSigned = process.env.SMTP_ALLOW_SELF_SIGNED === 'true';

  const transporter = nodemailer.createTransport({
    host: getRequiredEnv('SMTP_HOST'),
    port: smtpPort,
    secure: false,
    auth: {
      user: getRequiredEnv('SMTP_USER'),
      pass: getRequiredEnv('SMTP_KEY'),
    },
    tls: allowSelfSigned
      ? {
          // Allows connecting when the SMTP host presents a self-signed certificate
          rejectUnauthorized: false,
        }
      : undefined,
  });

  const supportEmail = process.env.SUPPORT_EMAIL?.trim() || defaultSupportEmail;

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || defaultFromAddress,
    replyTo: supportEmail,
    to: params.to,
    subject: 'Welcome to Work Hero KusinHero!',
    text: buildWelcomeEmailText(params),
    html: await renderWelcomeEmailTemplate(params),
  });
}

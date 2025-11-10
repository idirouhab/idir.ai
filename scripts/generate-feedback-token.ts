/**
 * Script to generate feedback tokens for newsletter emails
 * Usage: npx tsx scripts/generate-feedback-token.ts email@example.com 2024-01-15
 */

import { generateFeedbackToken } from '../lib/feedback-token';

async function main() {
  const email = process.argv[2];
  const campaignDate = process.argv[3] || new Date().toISOString().split('T')[0];

  if (!email) {
    console.error('Usage: npx tsx scripts/generate-feedback-token.ts email@example.com [YYYY-MM-DD]');
    process.exit(1);
  }

  const token = await generateFeedbackToken({
    email,
    campaignDate,
  });

  console.log('\n📧 Feedback Token Generated\n');
  console.log('Email:', email);
  console.log('Campaign Date:', campaignDate);
  console.log('\nToken:', token);
  console.log('\nFeedback URLs:');
  console.log('Very Useful:', `https://idir.ai/api/newsletter/feedback?token=${token}&type=very_useful`);
  console.log('Useful:     ', `https://idir.ai/api/newsletter/feedback?token=${token}&type=useful`);
  console.log('Not Useful: ', `https://idir.ai/api/newsletter/feedback?token=${token}&type=not_useful`);
  console.log('');
}

main().catch(console.error);

/**
 * Serverless API endpoint for Anthropic Claude API
 *
 * This is a Vercel serverless function that proxies requests to Anthropic's API
 * to avoid CORS issues with direct browser calls.
 *
 * Deploy this to Vercel (free tier) alongside your static site.
 *
 * Environment variable needed in Vercel:
 * ANTHROPIC_API_KEY - Your Anthropic API key
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { model, max_tokens, system, messages } = req.body;

    // Validate required fields
    if (!model || !max_tokens || !system || !messages) {
      return res.status(400).json({
        error: 'Missing required fields: model, max_tokens, system, messages'
      });
    }

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Server configuration error: ANTHROPIC_API_KEY not set'
      });
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

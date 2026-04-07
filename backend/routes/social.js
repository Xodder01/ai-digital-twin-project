const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();

// ── POST /auth/social/google — Verify Google ID token and login/register ────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from Google.' });
    }

    // Check if user exists, if not create one
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: name || 'Google User',
        age: 20, // default for social login
        gender: 'Other',
        user_type: 'Undergraduate',
        password_hash: 'GOOGLE_OAUTH_' + googleId, // no password for social users
        auth_provider: 'google'
      });
    }

    // Create JWT
    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        user_type: user.user_type
      }
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    return res.status(401).json({ error: 'Google authentication failed: ' + err.message });
  }
});

// ── GET /auth/social/github — Redirect user to GitHub OAuth ─────────────────
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `http://localhost:${process.env.PORT || 3001}/auth/social/github/callback`;
  const scope = 'user:email';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  res.redirect(githubAuthUrl);
});

// ── GET /auth/social/github/callback — Handle GitHub redirect ───────────────
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

  if (!code) {
    return res.redirect(`${frontendUrl}/auth?error=github_no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect(`${frontendUrl}/auth?error=github_token_failed`);
    }

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userResponse.data;

    // Get GitHub email (may be private)
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emailsResponse.data[0]?.email;
    }

    if (!email) {
      return res.redirect(`${frontendUrl}/auth?error=github_no_email`);
    }

    // Check if user exists, if not create one
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: githubUser.name || githubUser.login || 'GitHub User',
        age: 20,
        gender: 'Other',
        user_type: 'Undergraduate',
        password_hash: 'GITHUB_OAUTH_' + githubUser.id,
        auth_provider: 'github'
      });
    }

    // Create JWT
    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect back to frontend with token in URL
    res.redirect(`${frontendUrl}/auth?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error('GitHub auth error:', err.message);
    res.redirect(`${frontendUrl}/auth?error=github_auth_failed`);
  }
});

module.exports = router;

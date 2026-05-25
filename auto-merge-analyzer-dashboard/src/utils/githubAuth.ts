// GitHub OAuth integration for seamless authentication
export const GITHUB_OAUTH_CONFIG = {
  clientId: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: 'repo actions:read',
};

export const initiateGitHubOAuth = () => {
  const { clientId, redirectUri, scope } = GITHUB_OAUTH_CONFIG;
  
  if (!clientId) {
    throw new Error('GitHub OAuth client ID not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    response_type: 'code',
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  // This would typically go through your backend to exchange the code for a token
  // For security reasons, the client secret should not be exposed in the frontend
  throw new Error('OAuth token exchange should be implemented via backend');
};

export const getCurrentUser = async (token: string) => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  
  return response.json();
};
const API_BASE_URL = 'https://tta-1s7pstnev-poornas-projects-4b0c0949.vercel.app';

export const predictSentiment = async (tweet) => {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tweet }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to predict sentiment');
  }

  return response.json();
};

export const analyzeHashtag = async (hashtag) => {
  const response = await fetch(`${API_BASE_URL}/analyze-hashtag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hashtag }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze hashtag');
  }

  return response.json();
};

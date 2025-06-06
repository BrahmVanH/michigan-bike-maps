exports.handler = async function (event, context) {
  // Webhook security check
  const token = event.queryStringParameters.token;
  if (token !== process.env.REBUILD_TOKEN) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }

  // Trigger a new build via Netlify API
  const fetch = await import('node-fetch');
  await fetch.default(process.env.NETLIFY_BUILD_HOOK, {
    method: 'POST'
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Build triggered" })
  };
};
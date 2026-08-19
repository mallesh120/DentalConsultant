// generate-image.js removed
// This stub indicates the image-generation feature was intentionally removed.
// Any requests to this function will receive a 410 Gone with a clear message.

exports.handler = async function(event, context) {
  return {
    statusCode: 410,
    body: JSON.stringify({ error: 'Image generation feature removed.' }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };
};
export async function makeApiCallWithRetry(payload, endpoint = '/api/generate') {
    // This function now calls our own backend server, not Google's API directly.
    // The server will add the API key securely.
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    let attempts = 0;
    const maxAttempts = 4;
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(endpoint, options);
            if (!response.ok) {
                const errorData = await response.json();
                // Display more detailed error from the server
                throw new Error(`API Error: ${response.status} ${response.statusText}. Details: ${errorData.details || errorData.error || errorData.msg}`);
            }
            return response.json();
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) throw error;
            const delay = Math.pow(2, attempts) * 1000;
            console.log(`Attempt ${attempts} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
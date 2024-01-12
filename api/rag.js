require("dotenv").config();
const https = require('https');
const apiKey = process.env.TAVILY_KEY; // Use in production

async function search(query) {
    const baseUrl = 'https://api.tavily.com/';
    const endpoint = 'search';

    // Construct the URL
    const url = `${baseUrl}${endpoint}`;

    // Define the request payload
    const data = {
        api_key: apiKey, // Ensure that 'apiKey' is defined in your scope
        query: query,
        search_depth: "basic",
        include_answer: true,
        include_images: false,
        include_raw_content: false,
        max_results: 3,
        include_domains: [],
        exclude_domains: [],
    };

    // Convert data to JSON
    const jsonData = JSON.stringify(data);

    // Define request options
    const optionsRequest = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': jsonData.length
        }
    };

    // Wrap the request in a Promise for async/await
    return new Promise((resolve, reject) => {
        const req = https.request(url, optionsRequest, (res) => {
            let responseData = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                resolve(responseData); // Resolve with the response data
            });
        });

        // Handle errors
        req.on('error', (error) => {
            reject(`Error: ${error.message}`);
        });

        // Send the JSON data
        req.write(jsonData);
        req.end();
    });
}

async function main(query) {

    let ragOutput = "";
    const suffix = " || END OF SYSTEM MESSAGE **";

    try {
        const response = await search(query);
        const responseJSON = JSON.parse(response);
        const answer = responseJSON.answer;
        const sourceUrls = responseJSON.results.map(result => result.url);
        ragOutput = `** SYSTEM MESSAGE || RETRIEVAL-AUGMENTED GENERATION (RAG) AGENT HAS ADDED SOME RELEVANT CONTEXT TO THE USER'S MESSAGE. USE THE FOLLOWING FACT-CHECKED TEXT TO BETTER UNDERSTAND THE USER'S INTENTION AND IMPROVE YOUR RESPONSE: ${answer} || Append these sources provided by the RAG agent in your response as markdown-formatted link: ${sourceUrls}` + suffix;
        return ragOutput;
    } catch (error) {
        console.error(error);
    }
}

// Export
module.exports = main;
const { google } = require('googleapis');
const axios = require('axios');
const ScheduledCall = require('../models/ScheduledCall'); // Assuming a model exists for scheduled calls

// Configuration from environment variables for better security
const RETELL_API_KEY = process.env.RETELL_API_KEY || 'key_f7614a6406b70e3895c77248d532';
const FROM_NUMBER = process.env.RETELL_FROM_NUMBER || '+441164971883';
const AGENT_ID = process.env.RETELL_AGENT_ID || 'agent_a2c9fcb6d042f96725cb8927da';

const BATCH_SIZE = 19;

// Google Sheet IDs from environment variables
const ALL_ROWS_SHEET_ID = process.env.GOOGLE_ALL_ROWS_SHEET_ID || '1ODtrV2bE8x2r2fM36q9eNZ2xN58XvHczmkXWoD2bTy8';
const CURRENT_INDEX_SHEET_ID = process.env.GOOGLE_CURRENT_INDEX_SHEET_ID || '1gttSZvnn3hHFQWRrbnKn7Zo7i1kwvciIwQJmsUqp7MI';
const RESULTS_SHEET_ID = process.env.GOOGLE_RESULTS_SHEET_ID || '1uKsAU664HIFHzaDJEfLIlBsQcoPPiLtyirEKPxWjEGY';

const sheets = google.sheets('v4');

// --- Google Sheets Helper Functions ---

async function getAuth() {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return await auth.getClient();
}

async function getCurrentIndex(auth) {
    try {
        const res = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId: CURRENT_INDEX_SHEET_ID,
            range: 'Sheet1!A2', // More specific range
        });
        const value = res.data.values ? res.data.values[0][0] : '0';
        return parseInt(value, 10);
    } catch (error) {
        console.error('Error getting current index, defaulting to 0:', error.message);
        return 0;
    }
}

async function updateCurrentIndex(auth, index) {
    await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: CURRENT_INDEX_SHEET_ID,
        range: 'Sheet1!A2',
        valueInputOption: 'RAW',
        resource: {
            values: [[index]],
        },
    });
}

async function getAllRows(auth) {
    const res = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: ALL_ROWS_SHEET_ID,
        range: 'Sheet1',
    });
    return res.data.values || [];
}

async function appendResultsToSheet(auth, data) {
    await sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: RESULTS_SHEET_ID,
        range: 'Sheet1',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [
                [
                    data.nurse_name,
                    data.recording_url,
                    data.disconnection_reason,
                    data.total_duration_seconds,
                    data.transcript,
                    data.summary,
                    data['short main mudda'],
                    data.email,
                ],
            ],
        },
    });
}

// --- Retell AI API Helper Functions ---

async function createPhoneCall(phoneNumber, nurseName) {
    const response = await axios.post(
        'https://api.retellai.com/v2/create-phone-call',
        {
            from_number: FROM_NUMBER,
            to_number: phoneNumber,
            override_agent_id: AGENT_ID,
            retell_llm_dynamic_variables: { nurse_name: nurseName },
        },
        { headers: { Authorization: `Bearer ${RETELL_API_KEY}` } }
    );
    return response.data;
}

async function getCallDetails(callId) {
    const response = await axios.get(
        `https://api.retellai.com/v2/get-call/${callId}`,
        { headers: { Authorization: `Bearer ${RETELL_API_KEY}` } }
    );
    return response.data;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// --- Main Workflow Logic ---

const runWorkflow = async (req, res) => {
    console.log('--- Automation workflow started ---');
    try {
        const auth = await getAuth();
        let currentIndex = await getCurrentIndex(auth);
        const allRows = await getAllRows(auth);

        const headers = allRows[0];
        const dataRows = allRows.slice(1);

        if (currentIndex >= dataRows.length) {
            console.log('No more data to process. Resetting index to 0.');
            await updateCurrentIndex(auth, 0);
            if (res) res.status(200).json({ message: 'Workflow finished, index reset.' });
            return;
        }

        const endIndex = Math.min(currentIndex + BATCH_SIZE, dataRows.length);
        const batch = dataRows.slice(currentIndex, endIndex);

        console.log(`Processing batch of ${batch.length} items. Index ${currentIndex} to ${endIndex}`);

        for (const row of batch) {
            const rowData = headers.reduce((obj, header, i) => {
                obj[header.trim()] = row[i];
                return obj;
            }, {});

            const phoneNumber = rowData['phone Number'];
            const nurseName = rowData['nurse Name'];

            if (!phoneNumber || !nurseName) {
                console.warn('Skipping row due to missing phone number or name:', rowData);
                continue;
            }

            try {
                console.log(`Making call to ${nurseName} at ${phoneNumber}`);
                const call = await createPhoneCall(phoneNumber, nurseName);
                console.log(`Call created with ID: ${call.call_id}`);

                console.log('Waiting for 10 minutes for call to complete...');
                await delay(10 * 60 * 1000);

                console.log(`Fetching details for call ID: ${call.call_id}`);
                const callDetails = await getCallDetails(call.call_id);

                const resultData = {
                    nurse_name: callDetails.retell_llm_dynamic_variables.nurse_name,
                    recording_url: callDetails.recording_url,
                    disconnection_reason: callDetails.disconnection_reason,
                    total_duration_seconds: callDetails.call_cost.total_duration_seconds,
                    transcript: callDetails.transcript,
                    summary: callDetails.call_analysis.custom_analysis_data.summary,
                    'short main mudda': callDetails.call_analysis.custom_analysis_data['short main mudda'],
                    email: callDetails.call_analysis.custom_analysis_data.email,
                };

                console.log('Appending results to sheet...');
                await appendResultsToSheet(auth, resultData);
                console.log('Results appended for call.', call.call_id);

            } catch (error) {
                console.error(`Error processing row for ${nurseName}:`, error.response ? error.response.data : error.message);
            }
        }

        console.log(`Updating next index to: ${endIndex}`);
        await updateCurrentIndex(auth, endIndex);

        if (res) res.status(200).json({ message: `Workflow batch completed. Processed ${batch.length} records.` });

    } catch (error) {
        console.error('An error occurred during the workflow:', error);
        if (res) res.status(500).json({ message: 'An error occurred during the workflow.', error: error.message });
    }
    console.log('--- Automation workflow finished ---');
};

module.exports = {
    runWorkflow,
};

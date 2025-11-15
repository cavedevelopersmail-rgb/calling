# Workflow Automation Script

This script automates the process of making calls using Retell AI, fetching call details, and logging them into a Google Sheet. It's designed to run on a schedule.

## Setup

### 1. Google Cloud Platform & Google Sheets API

Before you can use this script, you need to set up Google Sheets API credentials.

1.  **Enable the Google Sheets API:**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   In the API Library, search for "Google Sheets API" and enable it.

2.  **Create a Service Account:**
    *   Go to "IAM & Admin" > "Service Accounts".
    *   Click "Create Service Account".
    *   Give it a name and description.
    *   Grant it the "Editor" role for access to your sheets.
    *   Click "Done".

3.  **Create and Download a Key:**
    *   Find your newly created service account in the list.
    *   Click the three dots under "Actions" and select "Manage keys".
    *   Click "Add Key" > "Create new key".
    *   Choose "JSON" as the key type and click "Create".
    *   A JSON file will be downloaded. **Keep this file secure.**

4.  **Share Your Google Sheets:**
    *   Open the JSON key file and find the `client_email` address.
    *   Open each of your Google Sheets:
        *   The sheet with all rows to process.
        *   The sheet to store the current index.
        *   The sheet to store the results.
    *   Click "Share" and add the `client_email` as an editor.

5.  **Set Environment Variable:**
    *   You need to set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of the JSON key file you downloaded. You can do this in your `.env` file in the `backend` directory.
    *   Add the following line to your `backend/.env` file, replacing `path/to/your/keyfile.json` with the actual path:
        ```
        GOOGLE_APPLICATION_CREDENTIALS="path/to/your/keyfile.json"
        ```

### 2. Retell AI API Key

*   The script requires a Retell AI API key. This is currently hardcoded in `automation.js`. For better security, you should move this to your `.env` file as well.

### 3. Install Dependencies

*   If you haven't already, run `npm install` in the `backend` directory to install all the necessary packages.

## Running the Script

To start the automation script, run the following command from the `backend` directory:

```bash
node automation.js
```

The script will then start the scheduler and will execute the workflow every day at 8 AM. For testing purposes, you can uncomment the `runWorkflow()` call at the end of `automation.js` to run it immediately.

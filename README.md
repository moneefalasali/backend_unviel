# Unveil AI Detection Platform

## 1. Project Overview

This project, **Unveil**, has been completely rebuilt and upgraded into a professional multimodal AI detection platform. It is designed to identify AI-generated content across images, audio, and text, providing insights into AI and human percentages, along with a confidence score. The core principle of this rebuild was to maintain the existing frontend user interface exactly as it was, focusing solely on improving functionality and migrating the backend to a robust PHP Laravel architecture.

## 2. Features

-   **AI-generated Image Detection**: Upload images or provide image URLs to detect AI generation with probability and confidence scores.
-   **AI-generated Audio Detection**: Upload audio files to determine if the voice is human or AI-generated, including confidence percentages.
-   **AI-generated Text Detection**: Paste text content for analysis to identify AI-generated portions, providing AI/human percentages and confidence.
-   **Social Media Post AI Analysis**: Paste a public URL from Twitter/X, LinkedIn, or Instagram to analyze whether the post content (text and images) is AI-generated.
-   **Connected Social Media Platform**: Connect your Twitter/X, LinkedIn, or Instagram accounts via OAuth to automatically fetch and analyze your recent posts for AI content.
-   **Consistent Frontend UI**: The original frontend design, layout, spacing, colors, typography, animations, styling, and responsiveness have been preserved.
-   **Robust Backend**: Rebuilt entirely with PHP and Laravel for high performance and scalability.
-   **Clean Architecture**: Backend follows clean architecture principles with clear separation of concerns (Controllers, Routes, Services, Models, Config).
-   **Environment Variable Management**: Secure handling of API keys and configurations using `.env` files.

## 3. Tech Stack

### Frontend

-   **React**: For building the user interface.
-   **TypeScript**: For type-safe JavaScript development.
-   **TailwindCSS**: For utility-first CSS styling.
-   **Vite**: As a fast build tool and development server.

### Backend

-   **PHP 8.1+**: The primary programming language.
-   **Laravel**: A powerful MVC PHP framework for building web applications.
-   **Composer**: Dependency manager for PHP.
-   **HTTP Client**: For making API calls to external detection services.

## 4. Installation Steps

To get this project up and running locally, follow these steps:

1.  **Clone the repository** (if applicable, or extract the provided `unveil-final.zip`):
    ```bash
    git clone <repository_url>
    cd unveil-project
    ```

2.  **Navigate to the project root directory**:
    ```bash
    cd /path/to/unveil-project
    ```

## 5. Backend Setup

1.  **Navigate to the `backend` directory**:
    ```bash
    cd backend
    ```

2.  **Install PHP dependencies**:
    ```bash
    composer install
    ```

3.  **Create a `.env` file** from the example:
    ```bash
    cp .env.example .env
    ```

4.  **Generate Application Key**:
    ```bash
    php artisan key:generate
    ```

5.  **Edit the `.env` file** and fill in your API keys for the detection services. The backend can work fully with OpenAI alone if you do not have other service keys.
    -   `OPENAI_API_KEY` (preferred for text, audio transcription/classification, and optional image analysis)
    -   `WASITAI_API_KEY` (optional, for image detection if you want a dedicated image service)
    -   `GPTZERO_API_KEY` (optional, for dedicated text detection)
    -   `AUDIO_DETECTION_API_KEY` (optional, if you have a specific audio detection provider)
    -   `AUDIO_DETECTION_URL` (optional: URL for a custom audio detection service; not a standalone service by itself)

    Example `.env` content:
    ```
    APP_NAME=Laravel
    APP_ENV=local
    APP_KEY=base64:...
    APP_DEBUG=true
    APP_URL=http://localhost

    LOG_CHANNEL=stack
    LOG_LEVEL=debug

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=laravel
    DB_USERNAME=root
    DB_PASSWORD=

    BROADCAST_DRIVER=log
    CACHE_DRIVER=file
    FILESYSTEM_DISK=local
    QUEUE_CONNECTION=sync
    SESSION_DRIVER=file
    SESSION_LIFETIME=120

    MEMCACHED_HOST=127.0.0.1

    REDIS_HOST=127.0.0.1
    REDIS_PASSWORD=null
    REDIS_PORT=6379

    MAIL_MAILER=smtp
    MAIL_HOST=mailpit
    MAIL_PORT=1025
    MAIL_USERNAME=null
    MAIL_PASSWORD=null
    MAIL_ENCRYPTION=null
    MAIL_FROM_ADDRESS="hello@example.com"
    MAIL_FROM_NAME="${APP_NAME}"

    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_DEFAULT_REGION=us-east-1
    AWS_BUCKET=
    AWS_USE_PATH_STYLE_ENDPOINT=false

    PUSHER_APP_ID=
    PUSHER_APP_KEY=
    PUSHER_APP_SECRET=
    PUSHER_APP_CLUSTER=mt1

    VITE_APP_NAME="Laravel"
    VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
    VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

    OPENAI_API_KEY=your_openai_api_key
    OPENAI_BASE_URL=https://api.openai.com
    WASITAI_API_KEY=your_wasitai_api_key
    GPTZERO_API_KEY=your_gptzero_api_key
    AUDIO_DETECTION_API_KEY=your_audio_detection_api_key
    AUDIO_DETECTION_URL=https://example-audio-detection.com/endpoint  # optional, only if you use a dedicated audio detection provider
    ```

6.  **Run the Laravel backend server**:
    ```bash
    php artisan serve --host 0.0.0.0 --port 8000
    ```
    The backend will be accessible at `http://localhost:8000`.

## 6. Frontend Setup

1.  **Navigate to the `frontend` directory**:
    ```bash
    cd ../frontend
    ```

2.  **Ensure your `.env` file is configured** to point to the new backend. The `VITE_API_URL` should be set to `http://localhost:8000/api`.
    ```
    VITE_API_URL=http://localhost:8000/api
    ```

3.  **Install Node.js dependencies**:
    ```bash
    npm install
    ```

4.  **Run the frontend development server**:
    ```bash
    npm run dev
    ```
    The frontend will typically be accessible at `http://localhost:5173` (or another port specified by Vite).

## 7. Environment Variables

The project uses environment variables for sensitive information and configuration. These are loaded from `.env` files. 

### Backend (`backend/.env`)

-   `OPENAI_API_KEY`: API key for the OpenAI service. This is the preferred fallback for text, audio transcription/classification, and optional image analysis.
-   `OPENAI_BASE_URL`: OpenAI API base URL (defaults to `https://api.openai.com`).
-   `WASITAI_API_KEY`: API key for the image detection service (e.g., WasItAI).
-   `GPTZERO_API_KEY`: API key for the text detection service (e.g., GPTZero).
-   `AUDIO_DETECTION_API_KEY`: API key for the audio detection service (e.g., Hive Moderation, ElevenLabs, Resemble AI).
-   `AUDIO_DETECTION_URL`: Optional custom audio detection service endpoint when using `AUDIO_DETECTION_API_KEY`.
-   `APP_PORT`: The port on which the Laravel backend will run (default: `8000`).
-   `APP_HOST`: The host address for the Laravel backend (default: `0.0.0.0`).

### Frontend (`frontend/.env`)

-   `VITE_API_URL`: The base URL for the backend API (e.g., `http://localhost:8000/api`).

## 8. Running Locally

To run the full application locally, you need to start both the backend and frontend servers:

1.  **Start Backend** (in one terminal):
    ```bash
    cd backend
    php artisan serve --host 0.0.0.0 --port 8000
    ```

2.  **Start Frontend** (in another terminal):
    ```bash
    cd frontend
    npm run dev
    ```

Open your browser to the address provided by the frontend development server (e.g., `http://localhost:5173`) to access the application.

## 9. API Usage Examples

The Laravel backend exposes the following endpoints:

### `POST /api/analyze-image`

Analyzes an image for AI generation.

-   **Request Body**:
    ```json
    {
      "image": "<base64_encoded_image_string>"
    }
    ```
-   **Response**:
    ```json
    {
      "type": "image",
      "classification": "AI Generated",
      "ai_percentage": 91.0,
      "human_percentage": 9.0,
      "confidence": 0.91,
      "explanation": "High probability of AI generation detected in image patterns."
    }
    ```

### `POST /api/analyze-audio`

Analyzes an audio file for AI generation.

-   **Request Body**:
    ```json
    {
      "audio": "<base64_encoded_audio_string>"
    }
    ```
-   **Response**:
    ```json
    {
      "type": "audio",
      "classification": "Human Voice",
      "ai_percentage": 12.0,
      "human_percentage": 88.0,
      "confidence": 0.88,
      "explanation": "The audio characteristics match natural human speech patterns."
    }
    ```

### `POST /api/analyze-text`

Analyzes text content for AI generation.

-   **Request Body**:
    ```json
    {
      "text": "The quick brown fox jumps over the lazy dog."
    }
    ```
-   **Response**:
    ```json
    {
      "type": "text",
      "classification": "Likely AI",
      "ai_percentage": 84.0,
      "human_percentage": 16.0,
      "confidence": 0.84,
      "explanation": "The text exhibits patterns consistent with AI language models."
    }
    ```

### `POST /api/analyze-social-post`

Analyzes a public social media post for AI generation.

-   **Supported Platforms**: Twitter/X, LinkedIn, Instagram (Public posts only).
-   **Request Body**:
    ```json
    {
      "url": "https://x.com/username/status/123456789"
    }
    ```
-   **Response**:
    ```json
    {
      "platform": "Twitter/X",
      "post_type": "text + image",
      "text_ai_percentage": 84,
      "image_ai_percentage": 91,
      "overall_ai_probability": 88,
      "human_probability": 12,
      "classification": "Likely AI Generated",
      "confidence": 0.89,
      "explanation": "Analysis of the Twitter/X post shows high probability of AI involvement in both text and visual elements."
    }
    ```

### `GET /api/auth/{provider}/redirect`

Redirects the user to the social media provider for OAuth authentication.
-   **Providers**: `twitter`, `linkedin`, `instagram`

### `GET /api/social/accounts`

Returns a list of connected social media accounts for the authenticated user.

### `GET /api/social/posts`

Fetches and analyzes recent posts from all connected social media accounts.


<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the allowed origins and headers for the frontend SPA.
    | Ensure credentials are supported so cookies and auth headers flow
    | correctly between Vercel and Laravel Cloud.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter(array_map('trim', explode(',', env(
        'CORS_ALLOWED_ORIGINS',
        trim((string) env('FRONTEND_URL', 'https://unveil-eta.vercel.app')).',https://unveil-cj6lfyxsk-unviel-s-projects.vercel.app,http://localhost:5173,http://127.0.0.1:5173'
    )))),

    'allowed_origins_patterns' => ['^https:\/\/.*\.vercel\.app$'],

    'allowed_headers' => ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'X-CSRF-TOKEN'],

    'exposed_headers' => ['Authorization'],

    'max_age' => 3600,

    'supports_credentials' => true,

];

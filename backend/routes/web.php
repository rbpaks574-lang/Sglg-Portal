<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'SGLG Document Submission Portal API',
        'status' => 'active',
        'version' => '1.0.0'
    ]);
});

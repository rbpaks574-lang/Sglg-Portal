<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarangayController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckerController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ─── Protected Routes ─────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Categories (all authenticated users)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    // Barangays (all authenticated users, for filtering)
    Route::get('/barangays/list', [\App\Http\Controllers\Api\BarangayController::class, 'list']);

    // Announcements (all authenticated users can read)
    Route::get('/announcements', [AnnouncementController::class, 'index']);

    // Submissions (all authenticated users)
    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/{submission}', [SubmissionController::class, 'show']);
    Route::get('/submissions/{submission}/download', [SubmissionController::class, 'download']);
    Route::get('/submissions/{submission}/preview', [SubmissionController::class, 'preview']);

    // ─── Barangay Routes ──────────────────────────────────────────────
    Route::middleware('role:barangay')->prefix('barangay')->group(function () {
        Route::get('/dashboard', [BarangayController::class, 'dashboard']);
        Route::get('/required-documents', [BarangayController::class, 'requiredDocuments']);
        Route::post('/submissions', [SubmissionController::class, 'store']);
        Route::post('/submissions/{submission}/resubmit', [SubmissionController::class, 'resubmit']);
    });

    // ─── Checker Routes ───────────────────────────────────────────────
    Route::middleware('role:checker,admin')->prefix('checker')->group(function () {
        Route::get('/dashboard', [CheckerController::class, 'dashboard']);
        Route::get('/pending', [CheckerController::class, 'pending']);
        Route::post('/submissions/{submission}/review', [SubmissionController::class, 'review']);
    });

    // ─── Admin Routes ─────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboardStats']);
        Route::get('/analytics', [AdminController::class, 'analytics']);

        // User management
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);

        // Barangay management
        Route::get('/barangays', [AdminController::class, 'barangays']);
        Route::get('/barangays/{barangay}', [AdminController::class, 'showBarangay']);
        Route::put('/barangays/{barangay}', [AdminController::class, 'updateBarangay']);

        // Categories & Required Documents management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::post('/categories/{category}/documents', [CategoryController::class, 'addDocument']);
        Route::put('/documents/{document}', [CategoryController::class, 'updateDocument']);
        Route::delete('/documents/{document}', [CategoryController::class, 'deleteDocument']);

        // Announcements management
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

        // Audit logs
        Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
    });
});

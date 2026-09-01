<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Remark;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    /**
     * GET /api/submissions
     * Filtered by role: barangay sees own, checker sees all, admin sees all
     */
    public function index(Request $request)
    {
        $query = Submission::with(['barangay', 'requiredDocument.category', 'submitter', 'reviewer', 'remarks']);

        // Role-based filtering
        if ($request->user()->isBarangay()) {
            $query->where('barangay_id', $request->user()->barangay_id);
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        if ($request->filled('category_id')) {
            $query->whereHas('requiredDocument', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%")
                  ->orWhereHas('barangay', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->query('sort_by') === 'barangay') {
            $query->join('barangays', 'submissions.barangay_id', '=', 'barangays.id')
                  ->orderBy('barangays.name', $request->query('sort_dir', 'asc'))
                  ->select('submissions.*');
        } else {
            $query->orderBy('submissions.created_at', $request->query('sort_dir', 'desc'));
        }

        $submissions = $query->paginate($request->get('per_page', 15));

        return response()->json($submissions);
    }

    /**
     * POST /api/submissions
     * Barangay submits a document
     */
    public function store(Request $request)
    {
        $request->validate([
            'required_document_id' => 'required|exists:required_documents,id',
            'file' => 'required|file|max:10240', // 10MB
            'submitter_notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        if (!$user->isBarangay()) {
            return response()->json(['message' => 'Only barangay users can submit documents'], 403);
        }

        $file = $request->file('file');
        $path = $file->store('submissions', 'public');

        // Determine score (5pts on-time, 2pts late)
        $reqDoc = \App\Models\RequiredDocument::find($request->required_document_id);
        $score = 5; // Default on-time
        if ($reqDoc && $reqDoc->deadline && now()->startOfDay()->gt($reqDoc->deadline->startOfDay())) {
            $score = 2; // Late
        }

        $submission = Submission::create([
            'barangay_id' => $user->barangay_id,
            'required_document_id' => $request->required_document_id,
            'submitted_by' => $user->id,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
            'score' => $score,
            'submitter_notes' => $request->submitter_notes,
        ]);

        AuditLog::log('submit', $user->id, 'Submission', $submission->id,
            "Document submitted: {$submission->original_filename}");

        return response()->json([
            'message' => 'Document submitted successfully',
            'submission' => $submission->load(['requiredDocument.category', 'barangay']),
        ], 201);
    }

    /**
     * GET /api/submissions/{id}
     */
    public function show(Request $request, Submission $submission)
    {
        if ($request->user()->isBarangay() && $submission->barangay_id !== $request->user()->barangay_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submission->load(['barangay', 'requiredDocument.category', 'submitter', 'reviewer', 'remarks.user']);

        return response()->json($submission);
    }

    /**
     * POST /api/submissions/{id}/review
     * Checker approves or returns a submission
     */
    public function review(Request $request, Submission $submission)
    {
        $request->validate([
            'action' => 'required|in:approve,return',
            'score' => 'nullable|integer|min:0|max:100',
            'remark' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();
        if (!$user->isChecker() && !$user->isAdmin()) {
            return response()->json(['message' => 'Only checkers/admins can review'], 403);
        }

        $newStatus = $request->action === 'approve' ? 'verified' : 'returned';

        $submission->update([
            'status' => $newStatus,
            'reviewed_at' => now(),
            'reviewed_by' => $user->id,
            'score' => $request->score,
        ]);

        // Add remark if provided
        if ($request->filled('remark')) {
            Remark::create([
                'submission_id' => $submission->id,
                'user_id' => $user->id,
                'message' => $request->remark,
                'type' => $request->action === 'approve' ? 'approval' : 'correction',
            ]);
        }

        // Recalculate barangay score
        $submission->barangay->recalculateScore();

        AuditLog::log("review_{$newStatus}", $user->id, 'Submission', $submission->id,
            "Submission {$newStatus}: {$submission->original_filename}");

        return response()->json([
            'message' => "Submission {$newStatus} successfully",
            'submission' => $submission->load(['remarks.user', 'reviewer']),
        ]);
    }

    /**
     * POST /api/submissions/{id}/resubmit
     * Barangay resubmits a returned document
     */
    public function resubmit(Request $request, Submission $submission)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'submitter_notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        if (!$user->isBarangay() || $submission->barangay_id !== $user->barangay_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($submission->status !== 'returned') {
            return response()->json(['message' => 'Only returned submissions can be resubmitted'], 422);
        }

        // Delete old file
        Storage::disk('public')->delete($submission->file_path);

        $file = $request->file('file');
        $path = $file->store('submissions', 'public');

        $submission->update([
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
            'submitter_notes' => $request->submitter_notes,
            'reviewed_at' => null,
            'reviewed_by' => null,
            'score' => null,
        ]);

        AuditLog::log('resubmit', $user->id, 'Submission', $submission->id,
            "Document resubmitted: {$submission->original_filename}");

        return response()->json([
            'message' => 'Document resubmitted successfully',
            'submission' => $submission->load(['requiredDocument.category', 'barangay']),
        ]);
    }

    /**
     * GET /api/submissions/{id}/download
     */
    public function download(Request $request, Submission $submission)
    {
        if ($request->user()->isBarangay() && $submission->barangay_id !== $request->user()->barangay_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Storage::disk('public')->exists($submission->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($submission->file_path, $submission->original_filename);
    }

    /**
     * GET /api/submissions/{id}/preview
     * Stream file for inline viewing (PDF, Images, etc.)
     */
    public function preview(Request $request, Submission $submission)
    {
        if ($request->user()->isBarangay() && $submission->barangay_id !== $request->user()->barangay_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Storage::disk('public')->exists($submission->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $fullPath = Storage::disk('public')->path($submission->file_path);
        
        $mimeType = match (strtolower($submission->file_type ?? pathinfo($fullPath, PATHINFO_EXTENSION))) {
            'pdf' => 'application/pdf',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            default => mime_content_type($fullPath) ?: 'application/octet-stream',
        };

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $submission->original_filename . '"',
        ]);
    }
}

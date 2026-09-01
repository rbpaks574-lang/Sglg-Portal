<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Submission;
use Illuminate\Http\Request;

class BarangayController extends Controller
{
    /**
     * GET /api/barangay/dashboard
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $barangay = Barangay::findOrFail($user->barangay_id);

        $totalSubmissions = Submission::where('barangay_id', $barangay->id)->count();
        $pendingSubmissions = Submission::where('barangay_id', $barangay->id)->where('status', 'pending')->count();
        $verifiedSubmissions = Submission::where('barangay_id', $barangay->id)->where('status', 'verified')->count();
        $returnedSubmissions = Submission::where('barangay_id', $barangay->id)->where('status', 'returned')->count();

        // Submission progress per category
        $categories = Category::with(['requiredDocuments' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true)->orderBy('sort_order')->get();

        $progress = $categories->map(function ($cat) use ($barangay) {
            $totalDocs = $cat->requiredDocuments->count();
            $verifiedDocs = Submission::where('barangay_id', $barangay->id)
                ->where('status', 'verified')
                ->whereHas('requiredDocument', function ($q) use ($cat) {
                    $q->where('category_id', $cat->id);
                })
                ->distinct('required_document_id')
                ->count('required_document_id');

            return [
                'category' => $cat->name,
                'category_id' => $cat->id,
                'total' => $totalDocs,
                'verified' => $verifiedDocs,
                'percentage' => $totalDocs > 0 ? round(($verifiedDocs / $totalDocs) * 100) : 0,
            ];
        });

        // Recent submissions
        $recentSubmissions = Submission::with(['requiredDocument.category'])
            ->where('barangay_id', $barangay->id)
            ->latest()
            ->limit(5)
            ->get();

        // Active announcements
        $announcements = Announcement::active()
            ->with('creator:id,name')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Upcoming deadlines
        $upcomingDeadlines = \App\Models\RequiredDocument::where('is_active', true)
            ->whereNotNull('deadline')
            ->where('deadline', '>=', now())
            ->orderBy('deadline')
            ->limit(5)
            ->get();

        return response()->json([
            'barangay' => $barangay,
            'compliance_score' => $barangay->compliance_score,
            'total_submissions' => $totalSubmissions,
            'pending_submissions' => $pendingSubmissions,
            'verified_submissions' => $verifiedSubmissions,
            'returned_submissions' => $returnedSubmissions,
            'progress' => $progress,
            'recent_submissions' => $recentSubmissions,
            'announcements' => $announcements,
            'upcoming_deadlines' => $upcomingDeadlines,
        ]);
    }

    /**
     * GET /api/barangay/required-documents
     * Shows what documents the barangay needs to submit with their status
     */
    public function requiredDocuments(Request $request)
    {
        $user = $request->user();
        $barangayId = $user->barangay_id;

        $categories = Category::with(['requiredDocuments' => function ($q) {
            $q->where('is_active', true)->orderBy('sort_order');
        }])->where('is_active', true)->orderBy('sort_order')->get();

        $result = $categories->map(function ($cat) use ($barangayId) {
            $docs = $cat->requiredDocuments->map(function ($doc) use ($barangayId) {
                $latestSubmission = Submission::where('barangay_id', $barangayId)
                    ->where('required_document_id', $doc->id)
                    ->latest()
                    ->first();

                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'description' => $doc->description,
                    'frequency' => $doc->frequency,
                    'accepted_formats' => $doc->accepted_formats,
                    'deadline' => $doc->deadline,
                    'latest_submission' => $latestSubmission,
                    'status' => $latestSubmission ? $latestSubmission->status : 'not_submitted',
                ];
            });

            return [
                'category' => $cat->name,
                'category_id' => $cat->id,
                'type' => $cat->type,
                'documents' => $docs,
            ];
        });

        return response()->json($result);
    }

    /**
     * GET /api/barangays/list
     * Public list of all barangays for dropdowns (id and name only)
     */
    public function list()
    {
        return response()->json(Barangay::orderBy('name')->select('id', 'name')->get());
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;

class CheckerController extends Controller
{
    /**
     * GET /api/checker/dashboard
     */
    public function dashboard(Request $request)
    {
        $pendingCount = Submission::where('status', 'pending')->count();
        $reviewedToday = Submission::whereDate('reviewed_at', today())->count();
        $totalReviewed = Submission::whereIn('status', ['verified', 'returned'])->count();
        $returnedCount = Submission::where('status', 'returned')->count();

        $pendingQueue = Submission::with(['barangay', 'requiredDocument.category', 'submitter'])
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->limit(20)
            ->get();

        $recentlyReviewed = Submission::with(['barangay', 'requiredDocument.category', 'reviewer'])
            ->whereIn('status', ['verified', 'returned'])
            ->orderByDesc('reviewed_at')
            ->limit(10)
            ->get();

        return response()->json([
            'pending_count' => $pendingCount,
            'reviewed_today' => $reviewedToday,
            'total_reviewed' => $totalReviewed,
            'returned_count' => $returnedCount,
            'pending_queue' => $pendingQueue,
            'recently_reviewed' => $recentlyReviewed,
        ]);
    }

    /**
     * GET /api/checker/pending
     */
    public function pending(Request $request)
    {
        $query = Submission::with(['barangay', 'requiredDocument.category', 'submitter'])
            ->where('status', 'pending');

        if ($request->filled('barangay_id')) {
            $query->where('barangay_id', $request->barangay_id);
        }

        if ($request->filled('category_id')) {
            $query->whereHas('requiredDocument', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        return response()->json($query->orderBy('created_at')->paginate($request->get('per_page', 20)));
    }
}

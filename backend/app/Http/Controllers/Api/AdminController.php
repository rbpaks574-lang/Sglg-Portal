<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Barangay;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ─── Dashboard Stats ───────────────────────────────────────────────
    public function dashboardStats()
    {
        $totalBarangays = Barangay::count();
        $totalSubmissions = Submission::count();
        $pendingSubmissions = Submission::where('status', 'pending')->count();
        $verifiedSubmissions = Submission::where('status', 'verified')->count();
        $returnedSubmissions = Submission::where('status', 'returned')->count();
        
        $lateSubmissions = Submission::join('required_documents', 'submissions.required_document_id', '=', 'required_documents.id')
            ->whereNotNull('required_documents.deadline')
            ->whereRaw('DATE(submissions.created_at) > DATE(required_documents.deadline)')
            ->count();

        $totalUsers = User::count();
        $avgScore = Barangay::avg('compliance_score');

        // Submissions by status for chart
        $statusChart = Submission::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Top 10 compliant barangays
        $topBarangays = Barangay::orderByDesc('compliance_score')
            ->limit(10)
            ->get(['id', 'name', 'compliance_score']);

        // Bottom 10 barangays
        $bottomBarangays = Barangay::orderBy('compliance_score')
            ->limit(10)
            ->get(['id', 'name', 'compliance_score']);

        // Recent submissions
        $recentSubmissions = Submission::with(['barangay', 'requiredDocument.category', 'submitter'])
            ->latest()
            ->limit(10)
            ->get();

        // Submissions per barangay
        $submissionsPerBarangay = Submission::selectRaw('barangay_id, COUNT(*) as total')
            ->groupBy('barangay_id')
            ->with('barangay:id,name')
            ->get();

        return response()->json([
            'total_barangays' => $totalBarangays,
            'total_submissions' => $totalSubmissions,
            'pending_submissions' => $pendingSubmissions,
            'verified_submissions' => $verifiedSubmissions,
            'returned_submissions' => $returnedSubmissions,
            'late_submissions' => $lateSubmissions,
            'total_users' => $totalUsers,
            'average_compliance_score' => round($avgScore, 2),
            'status_chart' => $statusChart,
            'top_barangays' => $topBarangays,
            'bottom_barangays' => $bottomBarangays,
            'recent_submissions' => $recentSubmissions,
            'submissions_per_barangay' => $submissionsPerBarangay,
        ]);
    }

    // ─── User Management ───────────────────────────────────────────────
    public function users(Request $request)
    {
        $query = User::with('barangay');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('name')->paginate($request->get('per_page', 15)));
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:barangay,checker,admin',
            'barangay_id' => 'required_if:role,barangay|exists:barangays,id',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'barangay_id' => $request->role === 'barangay' ? $request->barangay_id : null,
            'phone' => $request->phone,
            'position' => $request->position,
        ]);

        AuditLog::log('create_user', $request->user()->id, 'User', $user->id,
            "User created: {$user->name} ({$user->role})");

        return response()->json(['message' => 'User created', 'user' => $user], 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:barangay,checker,admin',
            'barangay_id' => 'nullable|exists:barangays,id',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        $data = $request->only(['name', 'email', 'role', 'phone', 'position', 'is_active']);

        if ($request->has('barangay_id')) {
            $data['barangay_id'] = $request->role === 'barangay' ? $request->barangay_id : null;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        AuditLog::log('update_user', $request->user()->id, 'User', $user->id,
            "User updated: {$user->name}");

        return response()->json(['message' => 'User updated', 'user' => $user->load('barangay')]);
    }

    public function destroyUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        AuditLog::log('delete_user', $request->user()->id, 'User', $user->id,
            "User deleted: {$user->name}");

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    // ─── Barangay Management ───────────────────────────────────────────
    public function barangays()
    {
        return response()->json(
            Barangay::withCount(['submissions' => function ($q) {
                $q->where('status', 'verified');
            }])
            ->orderBy('name')
            ->get()
        );
    }

    public function showBarangay(Barangay $barangay)
    {
        $barangay->load(['submissions.requiredDocument.category', 'submissions.submitter', 'submissions.reviewer']);
        
        $stats = [
            'total_required' => \App\Models\RequiredDocument::where('is_active', true)->count(),
            'total_submitted' => $barangay->submissions->count(),
            'pending' => $barangay->submissions->where('status', 'pending')->count(),
            'verified' => $barangay->submissions->where('status', 'verified')->count(),
            'returned' => $barangay->submissions->where('status', 'returned')->count(),
        ];

        // Group submissions by category
        $categories = \App\Models\Category::with(['requiredDocuments' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true)->orderBy('sort_order')->get();

        $compliance = $categories->map(function ($cat) use ($barangay) {
            $docs = $cat->requiredDocuments->map(function ($doc) use ($barangay) {
                $submission = $barangay->submissions->where('required_document_id', $doc->id)->sortByDesc('created_at')->first();
                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'status' => $submission ? $submission->status : 'not_submitted',
                    'submission' => $submission
                ];
            });

            $total = $docs->count();
            $verified = $docs->where('status', 'verified')->count();

            return [
                'category' => $cat->name,
                'total' => $total,
                'verified' => $verified,
                'percentage' => $total > 0 ? round(($verified / $total) * 100) : 0,
                'documents' => $docs,
            ];
        });

        return response()->json([
            'barangay' => $barangay,
            'stats' => $stats,
            'compliance' => $compliance,
        ]);
    }

    public function updateBarangay(Request $request, Barangay $barangay)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'captain_name' => 'nullable|string|max:255',
            'secretary_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'population' => 'nullable|integer',
        ]);

        $barangay->update($request->only([
            'name', 'captain_name', 'secretary_name', 'contact_number', 'email', 'population',
        ]));

        return response()->json(['message' => 'Barangay updated', 'barangay' => $barangay]);
    }

    // ─── Audit Logs ────────────────────────────────────────────────────
    public function auditLogs(Request $request)
    {
        $query = AuditLog::with('user:id,name,email,role');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->orderByDesc('created_at')->paginate($request->get('per_page', 20)));
    }

    // ─── Analytics ─────────────────────────────────────────────────────
    public function analytics()
    {
        // Compliance ranking
        $ranking = Barangay::orderByDesc('compliance_score')
            ->get(['id', 'name', 'compliance_score'])
            ->map(function ($b, $i) {
                $b->rank = $i + 1;
                return $b;
            });

        // Submission trends (last 30 days)
        $trends = Submission::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Category completion rates
        $categories = \App\Models\Category::with(['requiredDocuments' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true)->get();

        $categoryStats = $categories->map(function ($cat) {
            $totalDocs = $cat->requiredDocuments->count();
            $totalBarangays = Barangay::count();
            $expectedSubmissions = $totalDocs * $totalBarangays;

            $verifiedCount = Submission::whereHas('requiredDocument', function ($q) use ($cat) {
                $q->where('category_id', $cat->id);
            })->where('status', 'verified')->count();

            return [
                'category' => $cat->name,
                'type' => $cat->type,
                'completion_rate' => $expectedSubmissions > 0
                    ? round(($verifiedCount / $expectedSubmissions) * 100, 2)
                    : 0,
                'verified' => $verifiedCount,
                'expected' => $expectedSubmissions,
            ];
        });

        // Overall compliance distribution
        $distribution = [
            'excellent' => Barangay::where('compliance_score', '>=', 80)->count(),
            'good' => Barangay::whereBetween('compliance_score', [60, 79.99])->count(),
            'fair' => Barangay::whereBetween('compliance_score', [40, 59.99])->count(),
            'poor' => Barangay::where('compliance_score', '<', 40)->count(),
        ];

        return response()->json([
            'ranking' => $ranking,
            'trends' => $trends,
            'category_stats' => $categoryStats,
            'distribution' => $distribution,
        ]);
    }
}

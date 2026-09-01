<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * GET /api/announcements
     */
    public function index(Request $request)
    {
        $query = Announcement::with('creator')->active();

        if (!$request->user()->isAdmin()) {
            $query->whereIn('target_role', ['all', $request->user()->role]);
            $query->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            });
        }

        $sortOrder = $request->query('sort', 'desc');

        $query->orderByDesc('is_pinned');
        
        if ($sortOrder === 'asc') {
            $query->orderBy('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        $announcements = $query->paginate(15);

        return response()->json($announcements);
    }

    /**
     * POST /api/announcements (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_role' => 'nullable|in:all,barangay,checker',
            'is_pinned' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
        ]);

        $announcement = Announcement::create([
            'created_by' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'priority' => $request->priority,
            'target_role' => $request->target_role ?? 'all',
            'is_pinned' => $request->is_pinned ?? false,
            'published_at' => $request->published_at ?? now(),
            'expires_at' => $request->expires_at,
        ]);

        AuditLog::log('create_announcement', $request->user()->id, 'Announcement', $announcement->id,
            "Announcement created: {$announcement->title}");

        return response()->json(['message' => 'Announcement created', 'announcement' => $announcement], 201);
    }

    /**
     * PUT /api/announcements/{announcement} (Admin only)
     */
    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'target_role' => 'sometimes|in:all,barangay,checker',
            'is_pinned' => 'nullable|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $announcement->update($request->only(['title', 'content', 'priority', 'target_role', 'is_pinned', 'expires_at']));

        return response()->json(['message' => 'Announcement updated', 'announcement' => $announcement]);
    }

    /**
     * DELETE /api/announcements/{announcement} (Admin only)
     */
    public function destroy(Request $request, Announcement $announcement)
    {
        AuditLog::log('delete_announcement', $request->user()->id, 'Announcement', $announcement->id,
            "Announcement deleted: {$announcement->title}");

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\RequiredDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     */
    public function index()
    {
        $categories = Category::with(['requiredDocuments' => function ($q) {
            $q->orderBy('sort_order');
        }])
        ->orderBy('sort_order')
        ->get();

        return response()->json($categories);
    }

    /**
     * GET /api/categories/{category}
     */
    public function show(Category $category)
    {
        $category->load(['requiredDocuments' => function ($q) {
            $q->orderBy('sort_order');
        }]);

        return response()->json($category);
    }

    /**
     * POST /api/admin/categories (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:core,essential',
            'sort_order' => 'nullable|integer',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'type' => $request->type,
            'sort_order' => $request->sort_order ?? (Category::max('sort_order') + 1),
            'is_active' => true,
        ]);

        AuditLog::log('create_category', $request->user()->id, 'Category', $category->id,
            "SGLG Category created: {$category->name}");

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category->load('requiredDocuments')
        ], 201);
    }

    /**
     * PUT /api/admin/categories/{category} (Admin only)
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:core,essential',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($request->only(['name', 'description', 'type', 'sort_order', 'is_active']));

        if ($request->filled('name')) {
            $category->update(['slug' => Str::slug($request->name)]);
        }

        AuditLog::log('update_category', $request->user()->id, 'Category', $category->id,
            "SGLG Category updated: {$category->name}");

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category->load('requiredDocuments')
        ]);
    }

    /**
     * DELETE /api/admin/categories/{category} (Admin only)
     */
    public function destroy(Request $request, Category $category)
    {
        AuditLog::log('delete_category', $request->user()->id, 'Category', $category->id,
            "SGLG Category deleted: {$category->name}");

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    /**
     * POST /api/admin/categories/{category}/documents (Admin only)
     * Admin specifies what document needs to be submitted
     */
    public function addDocument(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'required|in:monthly,quarterly,semi-annual,annual',
            'accepted_formats' => 'nullable|string',
            'max_file_size_mb' => 'nullable|integer|min:1|max:50',
            'deadline' => 'nullable|date',
            'sort_order' => 'nullable|integer',
            'template_file' => 'nullable|file|max:10240', // max 10MB
        ]);

        $templatePath = null;
        if ($request->hasFile('template_file')) {
            $templatePath = $request->file('template_file')->store('templates', 'public');
        }

        $doc = RequiredDocument::create([
            'category_id' => $category->id,
            'name' => $request->name,
            'description' => $request->description,
            'frequency' => $request->frequency,
            'accepted_formats' => $request->accepted_formats ?? 'pdf,docx,xlsx,jpg,png',
            'max_file_size_mb' => $request->max_file_size_mb ?? 10,
            'deadline' => $request->deadline,
            'sort_order' => $request->sort_order ?? (RequiredDocument::where('category_id', $category->id)->max('sort_order') + 1),
            'is_active' => true,
            'template_file_path' => $templatePath,
        ]);

        AuditLog::log('create_required_document', $request->user()->id, 'RequiredDocument', $doc->id,
            "Required document added under {$category->name}: {$doc->name}");

        return response()->json([
            'message' => 'Document requirement added successfully',
            'document' => $doc->load('category')
        ], 201);
    }

    /**
     * PUT /api/admin/documents/{document} (Admin only)
     */
    public function updateDocument(Request $request, RequiredDocument $document)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'sometimes|in:monthly,quarterly,semi-annual,annual',
            'accepted_formats' => 'nullable|string',
            'max_file_size_mb' => 'nullable|integer|min:1|max:50',
            'deadline' => 'nullable|date',
            'category_id' => 'sometimes|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'template_file' => 'nullable|file|max:10240',
        ]);

        $data = $request->only([
            'name', 'description', 'frequency', 'accepted_formats',
            'max_file_size_mb', 'deadline', 'category_id', 'sort_order', 'is_active'
        ]);

        if ($request->hasFile('template_file')) {
            if ($document->template_file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($document->template_file_path);
            }
            $data['template_file_path'] = $request->file('template_file')->store('templates', 'public');
        }

        $document->update($data);

        AuditLog::log('update_required_document', $request->user()->id, 'RequiredDocument', $document->id,
            "Required document updated: {$document->name}");

        return response()->json([
            'message' => 'Document requirement updated successfully',
            'document' => $document->load('category')
        ]);
    }

    /**
     * DELETE /api/admin/documents/{document} (Admin only)
     */
    public function deleteDocument(Request $request, RequiredDocument $document)
    {
        AuditLog::log('delete_required_document', $request->user()->id, 'RequiredDocument', $document->id,
            "Required document deleted: {$document->name}");

        $document->delete();

        return response()->json(['message' => 'Document requirement deleted successfully']);
    }
}

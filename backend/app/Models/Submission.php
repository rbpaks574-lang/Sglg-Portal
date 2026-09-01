<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id', 'required_document_id', 'submitted_by',
        'file_path', 'original_filename', 'file_type', 'file_size',
        'status', 'submitter_notes', 'reviewed_at', 'reviewed_by', 'score',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'file_size' => 'integer',
        'score' => 'integer',
    ];

    protected $appends = ['file_url', 'is_late'];

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }

    public function requiredDocument()
    {
        return $this->belongsTo(RequiredDocument::class);
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function remarks()
    {
        return $this->hasMany(Remark::class)->latest();
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeReturned($query)
    {
        return $query->where('status', 'returned');
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? url('storage/' . $this->file_path) : null;
    }

    public function getIsLateAttribute(): bool
    {
        if (!$this->requiredDocument || !$this->requiredDocument->deadline) {
            return false; // No deadline means it can't be late
        }

        // Compare the created_at date (start of day) to the deadline (start of day)
        return $this->created_at->startOfDay()->gt($this->requiredDocument->deadline->startOfDay());
    }
}

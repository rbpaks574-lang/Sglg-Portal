<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'purok_count', 'captain_name', 'secretary_name',
        'contact_number', 'email', 'population', 'compliance_score',
    ];

    protected $casts = [
        'compliance_score' => 'decimal:2',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function latestSubmissions()
    {
        return $this->hasMany(Submission::class)->latest();
    }

    /**
     * Recalculate compliance score based on verified submissions
     */
    public function recalculateScore(): void
    {
        $totalDocs = \App\Models\RequiredDocument::where('is_active', true)->count();
        if ($totalDocs === 0) {
            $this->update(['compliance_score' => 0]);
            return;
        }

        $verifiedCount = $this->submissions()
            ->where('status', 'verified')
            ->distinct('required_document_id')
            ->count('required_document_id');

        $score = round(($verifiedCount / $totalDocs) * 100, 2);
        $this->update(['compliance_score' => $score]);
    }
}

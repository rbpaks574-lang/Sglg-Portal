<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequiredDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'description', 'frequency',
        'accepted_formats', 'max_file_size_mb', 'deadline',
        'sort_order', 'is_active', 'template_file_path',
    ];

    protected $casts = [
        'deadline' => 'date',
        'is_active' => 'boolean',
    ];

    protected $appends = ['template_url'];

    public function getTemplateUrlAttribute()
    {
        if ($this->template_file_path) {
            return asset('storage/' . $this->template_file_path);
        }
        return null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}

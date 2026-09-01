<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Financial Administration, Disaster Preparedness
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type')->default('core'); // core, essential
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('required_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name'); // e.g. Budget, For Disclosure, Disaster Plan
            $table->text('description')->nullable();
            $table->string('frequency')->default('annual'); // monthly, quarterly, semi-annual, annual
            $table->string('accepted_formats')->default('pdf'); // pdf, docx, xlsx, jpg, png
            $table->integer('max_file_size_mb')->default(10);
            $table->date('deadline')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('required_documents');
        Schema::dropIfExists('categories');
    }
};

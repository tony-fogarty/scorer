<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('player1_id')->nullable()->constrained('players');
            $table->foreignId('player2_id')->nullable()->constrained('players');
            $table->json('settings'); // Stores legs, sets, game type, etc
            $table->json('state')->nullable(); // Stores current match state (scores, progress)
            $table->enum('status', ['aborted', 'in_progress', 'complete'])->default('in_progress');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leg_id')->constrained()->onDelete('cascade');
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->integer('round_number');
            $table->integer('score'); // The score for this round
            $table->json('throws')->nullable(); // Individual dart throws [20, 20, 20]
            $table->integer('remaining_score'); // Score remaining after this round
            $table->boolean('is_bust')->default(false);
            $table->boolean('is_checkout')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('scores');
    }
};
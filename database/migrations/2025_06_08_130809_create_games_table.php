<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // '501', '301', etc.
            $table->integer('starting_score');
            $table->json('settings')->nullable(); // Game configuration (double in/out, etc.)
            $table->enum('status', ['pending', 'in_progress', 'completed', 'abandoned'])->default('pending');
            $table->integer('winner_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('games');
    }
};
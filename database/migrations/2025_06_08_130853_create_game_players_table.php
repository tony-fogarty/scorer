<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('game_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->integer('order_position'); // Player's turn order
            $table->integer('handicap')->default(0);
            $table->json('statistics')->nullable(); // Game-specific stats
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_players');
    }
};
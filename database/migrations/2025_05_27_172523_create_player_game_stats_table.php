<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlayerGameStatsTable extends Migration
{
    public function up(): void
    {
        Schema::create('player_game_stats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('game_id');
            $table->unsignedBigInteger('player_id');
            $table->integer('legs_for')->default(0);
            $table->integer('legs_against')->default(0);
            $table->integer('sets_for')->default(0);
            $table->integer('sets_against')->default(0);
            $table->integer('scores_0_59')->default(0);
            $table->integer('scores_60_79')->default(0);
            $table->integer('scores_80_99')->default(0);
            $table->integer('scores_100_plus')->default(0);
            $table->integer('scores_140_plus')->default(0);
            $table->integer('scores_170_plus')->default(0);
            $table->integer('scores_180')->default(0);
            $table->integer('high_finish')->nullable()->default(null);
            $table->integer('least_darts')->nullable()->default(null);
            $table->integer('total_score')->default(0);
            $table->integer('darts_thrown')->default(0);
            $table->decimal('average', 5, 2)->nullable();
            $table->timestamps();

            $table->foreign('game_id')->references('id')->on('games')->onDelete('cascade');
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_game_stats');
    }
}
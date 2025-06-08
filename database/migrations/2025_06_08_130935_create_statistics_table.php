<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->string('game_type'); // '501', '301', etc.
            $table->integer('games_played')->default(0);
            $table->integer('games_won')->default(0);
            $table->integer('legs_played')->default(0);
            $table->integer('legs_won')->default(0);
            $table->integer('total_throws')->default(0);
            $table->decimal('average_score', 5, 2)->default(0);
            $table->decimal('checkout_percentage', 5, 2)->default(0);
            $table->integer('highest_checkout')->default(0);
            $table->integer('hundred_plus_throws')->default(0);
            $table->integer('one_forty_plus_throws')->default(0);
            $table->integer('one_eighty_throws')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('statistics');
    }
};
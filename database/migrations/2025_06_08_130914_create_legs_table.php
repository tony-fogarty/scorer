<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('legs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('set_id')->constrained()->onDelete('cascade');
            $table->integer('leg_number');
            $table->integer('starter_id'); // Player who started the leg
            $table->integer('winner_id')->nullable();
            $table->integer('winning_score')->nullable();
            $table->integer('winning_throw_count')->nullable(); // Number of darts used for checkout
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('legs');
    }
};
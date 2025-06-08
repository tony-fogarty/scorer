<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('nickname')->nullable();
            $table->string('avatar')->nullable();
            // Player preferences
            $table->boolean('is_computer')->default(false);
            $table->integer('computer_skill_level')->nullable();
            $table->json('preferences')->nullable(); // Store customizable player settings
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('players');
    }
};
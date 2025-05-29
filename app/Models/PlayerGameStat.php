<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerGameStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'player_id',
        'legs_for',
        'legs_against',
        'sets_for',
        'sets_against',
        'scores_0_59',
        'scores_60_79',
        'scores_80_99',
        'scores_100_plus',
        'scores_140_plus',
        'scores_170_plus',
        'scores_180',
        'high_finish',
        'least_darts',
        'total_score',
        'darts_thrown',
        'average',
        'three_dart_average',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
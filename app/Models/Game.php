<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

/**
 * @property int $id
 * @property int $user_id
 * @property int $player1_id
 * @property int $player2_id
 * @property array $settings
 * @property array $state
 * @property string $status
 */


    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETE = 'complete';

    protected $fillable = [
        'user_id',
        'player1_id',
        'player2_id',
        'settings',
        'state',
        'status',
    ];

    protected $casts = [
        'settings' => 'array',
        'state' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function player1()
    {
        return $this->belongsTo(Player::class, 'player1_id');
    }

    public function player2()
    {
        return $this->belongsTo(Player::class, 'player2_id');
    }

    public function playerStats()
{
    return $this->hasMany(PlayerGameStat::class, 'game_id');
}
}

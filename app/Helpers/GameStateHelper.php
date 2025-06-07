<?php

namespace App\Helpers;

class GameStateHelper
{
    /**
     * Build the default game state structure for a new game.
     *
     * @param \App\Models\Player $player1
     * @param \App\Models\Player $player2
     * @return array
     */
    public static function defaultState($player1, $player2)
    {
        return [
            'player1' => [
                'id' => $player1->id,
                'name' => $player1->name
            ],
            'player2' => [
                'id' => $player2->id,
                'name' => $player2->name
            ],
            'sets' => [
                [
                    'setNumber' => 1,
                    'legs' => [
                        [
                            'legNumber' => 1,
                            'throws' => [1 => [], 2 => []],
                            'winner' => null,
                            'dartsThrown' => [1 => 0, 2 => 0],
                            'checkout' => [1 => null, 2 => null],
                        ]
                    ],
                    'setWinner' => null
                ]
            ],
            'gameWinner' => null
        ];
    }
}
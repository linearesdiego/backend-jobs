<?php

namespace App\Http\Enum;

class StatusEnum
{
    const PENDING = 'pending';
    const ACCEPTED = 'accepted';
    const REJECTED = 'rejected';
    const MODIFIED = 'modified';
    const SEND = 'sent';

    public static function getStatuses(): array
    {
        return [
            self::PENDING   ,
            self::ACCEPTED,
            self::REJECTED,
            self::MODIFIED,
            self::SEND,
        ];
    }
}



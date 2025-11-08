<?php

namespace App\Http\Enum;

class UserEnum
{
    const ROLE_CONTRATADOR = 'contratador';
    const ROLE_PROVEEDOR = 'proveedor';
    const ROLE_ADMINISTRADOR = 'administrador';

    public static function getRoles(): array
    {
        return [
            self::ROLE_CONTRATADOR,
            self::ROLE_PROVEEDOR,
            self::ROLE_ADMINISTRADOR,
        ];
    }
}

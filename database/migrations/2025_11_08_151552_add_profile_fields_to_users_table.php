<?php

use App\Http\Enum\UserEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::table('users', function (Blueprint $table) {
        $table->string('username')->nullable()->unique();
        $table->string('lastname')->nullable();
        $table->string('phone')->nullable();
        $table->string('address')->nullable();
        $table->string('city')->nullable();
        $table->string('state')->nullable();
        $table->string('zip_code')->nullable();
        $table->string('profile_picture')->nullable();
        $table->string('cover_photo')->nullable();
        $table->timestamp('last_login')->nullable();
        // ejemplo de enum/role
        $table->enum('role', UserEnum::getRoles())->default(UserEnum::ROLE_CONTRATADOR);
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
        $table->dropColumn([
            'username','lastname','numero_telefono','direccion_residencia',
            'ciudad','estado','zip_code','foto_perfil','foto_portada','ultimo_login','role'
        ]);
    });
    }
};

<?php

use App\Http\Enum\StatusEnum;
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
        Schema::create('contract_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->enum('status', StatusEnum::getStatuses())->default(StatusEnum::SEND);
            $table->string('provider_signature_hash')->nullable();
            $table->string('hirer_signature_hash')->nullable();
            $table->boolean('provider_signed')->default(false);
            $table->boolean('hirer_signed')->default(false);
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_revisions');
    }
};

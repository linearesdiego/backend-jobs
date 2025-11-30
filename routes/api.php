<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ProviderPostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::prefix('provider-posts')->group(function () {
    Route::get('/', [ProviderPostController::class, 'index']); // Listar publicadas
    Route::get('/{id}', [ProviderPostController::class, 'show']); // Ver detalle
});

Route::get('providers', [ProviderController::class, 'index']); // Listar proveedores
Route::get('providers/{id}', [ProviderController::class, 'show']); // Ver perfil público

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);


    // Provider - Solo el proveedor puede actualizar su perfil
    Route::put('providers/{id}', [ProviderController::class, 'update']);
    
    // Provider Posts - Solo el proveedor puede crear/editar/eliminar sus posts
    Route::post('provider-posts', [ProviderPostController::class, 'store']);
    Route::put('provider-posts/{id}', [ProviderPostController::class, 'update']);
    Route::delete('provider-posts/{id}', [ProviderPostController::class, 'destroy']);
});

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    public function index()
    {
        $providers = Provider::with(['user', 'jobTitle', 'providerPosts'])
            ->paginate(15);

        return response()->json($providers);
    }

    public function show($id)
    {
        $provider = Provider::with([
            'user',
            'jobTitle',
            'providerPosts' => function($query) {
                $query->where('status', 'published');
            },
           
        ])->findOrFail($id);

        return response()->json($provider);
    }

    public function update(Request $request, $id)
    {
        $provider = Provider::findOrFail($id);

        $validated = $request->validate([
            'bio' => 'nullable|string',
            'skills' => 'nullable|string',
            'experience_years' => 'nullable|integer',
            'hourly_rate' => 'nullable|numeric',
            'availability' => 'nullable|string',
            'job_title_id' => 'nullable|exists:job_titles,id'
        ]);

        $provider->update($validated);

        return response()->json([
            'message' => 'Provider updated successfully',
            'provider' => $provider->load(['user', 'jobTitle'])
        ]);
    }
}
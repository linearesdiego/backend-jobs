<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ProviderPost;
use Illuminate\Http\Request;

class ProviderPostController extends Controller
{
    public function index()
    {
        $posts = ProviderPost::with(['provider.user', 'jobTitle'])
            ->where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->paginate(15);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_title_id' => 'nullable|exists:job_titles,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'video_url' => 'required|string',
            'status' => 'nullable|in:draft,published,archived'
        ]);

        // Obtener el provider_id del usuario autenticado
        $provider = $request->user()->provider;
        
        if (!$provider) {
            return response()->json([
                'message' => 'You must be a provider to create posts.'
            ], 403);
        }

        $validated['provider_id'] = $provider->id;

        if (($validated['status'] ?? 'draft') === 'published') {
            $validated['published_at'] = now();
        }

        $post = ProviderPost::create($validated);

        return response()->json([
            'message' => 'Post created successfully',
            'post' => $post->load(['provider', 'jobTitle'])
        ], 201);
    }

    public function show($id)
    {
        $post = ProviderPost::with(['provider.user', 'jobTitle'])
            ->findOrFail($id);

        return response()->json($post);
    }

    public function update(Request $request, $id)
    {
        $post = ProviderPost::findOrFail($id);

        $validated = $request->validate([
            'job_title_id' => 'nullable|exists:job_titles,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'video_url' => 'sometimes|string',
            'status' => 'sometimes|in:draft,published,archived'
        ]);

        if (isset($validated['status']) && $validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post->load(['provider', 'jobTitle'])
        ]);
    }

    public function destroy($id)
    {
        $post = ProviderPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully'
        ]);
    }
}
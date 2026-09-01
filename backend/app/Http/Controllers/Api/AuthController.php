<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Auto-seed if database is empty on first boot
        if (User::count() === 0) {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        }

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Contact the administrator.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        AuditLog::log('login', $user->id, 'User', $user->id, 'User logged in');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'barangay_id' => $user->barangay_id,
                'barangay' => $user->barangay,
                'position' => $user->position,
            ],
            'token' => $token,
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        AuditLog::log('logout', $request->user()->id, 'User', $request->user()->id, 'User logged out');

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * GET /api/me
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('barangay');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'barangay_id' => $user->barangay_id,
            'barangay' => $user->barangay,
            'position' => $user->position,
            'phone' => $user->phone,
        ]);
    }

    /**
     * PUT /api/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'current_password' => 'required_with:password',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $user->fill($request->only(['name', 'phone', 'position']));
        $user->save();

        AuditLog::log('update_profile', $user->id, 'User', $user->id, 'User updated their profile');

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'barangay_id' => $user->barangay_id,
                'barangay' => $user->barangay,
                'position' => $user->position,
                'phone' => $user->phone,
            ]
        ]);
    }
}

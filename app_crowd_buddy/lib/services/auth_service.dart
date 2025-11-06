import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import '../utils/constants.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Register user with both Firebase and backend API
  Future<Map<String, dynamic>> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    UserCredential? userCredential;
    bool firebaseAccountCreated = false;

    try {
      print('🔵 Starting registration process...');
      print('📧 Email: $email');
      print('🌐 Backend URL: ${Constants.baseUrl}/auth/register');

      // Step 1: Create Firebase account
      print('🔵 Step 1: Creating Firebase account...');
      userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      firebaseAccountCreated = true;
      print('✅ Firebase account created successfully');
      print('🆔 Firebase UID: ${userCredential.user?.uid}');

      // Update display name (wrapped in try-catch to handle Firebase plugin bug)
      try {
        await userCredential.user?.updateDisplayName(name);
        print('✅ Display name updated');
      } catch (displayNameError) {
        print('⚠️ Display name update failed (non-critical): $displayNameError');
        // Continue anyway - this is a known Firebase plugin issue
      }

      // Step 2: Register with backend API
      print('🔵 Step 2: Registering with backend API...');

      final url = Uri.parse('${Constants.baseUrl}/auth/register');
      print('📍 Full URL: $url');

      final payload = {
        'name': name,
        'email': email,
        'phone': phone,
        'role': 'public',
        'password': password,
      };
      print('📦 Payload: ${jsonEncode(payload)}');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(payload),
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          print('⏱️ Request timed out after 15 seconds');
          throw Exception('Request timeout');
        },
      );

      print('📊 Response Status Code: ${response.statusCode}');
      print('📄 Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        print('✅ Backend registration successful');

        return {
          'success': true,
          'message': 'Account created successfully!',
          'user': userCredential.user,
          'backendData': data,
        };
      } else {
        // Backend registration failed, rollback Firebase account
        print('❌ Backend registration failed with status: ${response.statusCode}');
        print('🔄 Rolling back Firebase account...');

        try {
          await userCredential.user?.delete();
          await _auth.signOut(); // Extra signout to be safe
          print('✅ Firebase account rolled back');
        } catch (deleteError) {
          print('⚠️ Failed to rollback Firebase account: $deleteError');
        }

        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to register with server (Status: ${response.statusCode})',
        };
      }
    } on FirebaseAuthException catch (e) {
      print('❌ Firebase Auth Error: ${e.code} - ${e.message}');

      String message = 'An error occurred';

      if (e.code == 'weak-password') {
        message = 'The password is too weak';
      } else if (e.code == 'email-already-in-use') {
        message = 'An account already exists for this email';
      } else if (e.code == 'invalid-email') {
        message = 'Invalid email address';
      } else {
        message = e.message ?? 'Firebase authentication error';
      }

      return {
        'success': false,
        'message': message,
      };
    } catch (e) {
      print('❌ General Error: $e');
      print('📍 Error Type: ${e.runtimeType}');
      print('🔍 Stack Trace: ${StackTrace.current}');

      // If backend call failed and Firebase account was created, clean up
      if (firebaseAccountCreated && userCredential?.user != null) {
        print('🔄 Cleaning up Firebase account due to error...');
        try {
          await userCredential!.user!.delete();
          await _auth.signOut(); // Extra signout to be safe
          print('✅ Firebase account cleaned up');
        } catch (deleteError) {
          print('⚠️ Failed to cleanup Firebase account: $deleteError');
          // If cleanup fails, try signing out again
          try {
            await _auth.signOut();
          } catch (_) {}
        }
      }

      // Provide more specific error messages
      String errorMessage = 'Failed to connect to server. Please try again.';

      String errorString = e.toString().toLowerCase();

      if (errorString.contains('socketexception') ||
          errorString.contains('networkexception') ||
          errorString.contains('connection')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorString.contains('timeout')) {
        errorMessage = 'Request timed out. Server is not responding.';
      } else if (errorString.contains('formatexception')) {
        errorMessage = 'Invalid server response. Please contact support.';
      } else if (errorString.contains('certificateexception') ||
          errorString.contains('handshake')) {
        errorMessage = 'SSL connection error. Please check server configuration.';
      }

      return {
        'success': false,
        'message': errorMessage,
        'errorDetails': e.toString(), // Include detailed error for debugging
      };
    }
  }

  /// Login user (Firebase only, backend doesn't have login endpoint shown)
  Future<Map<String, dynamic>> loginUser({
    required String email,
    required String password,
  }) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      return {
        'success': true,
        'message': 'Logged in successfully!',
        'user': userCredential.user,
      };
    } on FirebaseAuthException catch (e) {
      String message = 'An error occurred';

      if (e.code == 'user-not-found') {
        message = 'No account found with this email';
      } else if (e.code == 'wrong-password') {
        message = 'Incorrect password';
      } else if (e.code == 'invalid-email') {
        message = 'Invalid email address';
      }

      return {
        'success': false,
        'message': message,
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to connect. Please try again.',
      };
    }
  }

  /// Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Get current user
  User? getCurrentUser() {
    return _auth.currentUser;
  }

  /// Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();
}
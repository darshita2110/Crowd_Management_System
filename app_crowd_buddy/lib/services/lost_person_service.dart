import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class LostPersonService {
  /// Submit a lost person report
  Future<Map<String, dynamic>> submitReport({
    required String reporterId,
    required String reporterName,
    required String reporterContact,
    required String personName,
    required int age,
    required String gender,
    required String description,
    required String lastSeenLocation,
    required String lastSeenTime,
    required String eventId,
    String? photoUrl,
  }) async {
    try {
      print('🔵 Submitting lost person report...');
      print('👤 Person: $personName');
      print('📍 Location: $lastSeenLocation');
      print('🕐 Time: $lastSeenTime');

      final url = Uri.parse('${Constants.baseUrl}/lost-persons/');
      print('🌐 API URL: $url');

      final payload = {
        'reporter_id': reporterId,
        'reporter_name': reporterName,
        'reporter_contact': reporterContact,
        'person_name': personName,
        'age': age,
        'gender': gender.toLowerCase(),
        'description': description,
        'last_seen_location': lastSeenLocation,
        'last_seen_time': lastSeenTime,
        'event_id': eventId,
        if (photoUrl != null) 'photo_url': photoUrl,
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

      print('📊 Response Status: ${response.statusCode}');
      print('📄 Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        print('✅ Report submitted successfully');
        print('🆔 Report ID: ${data['id']}');

        return {
          'success': true,
          'message': 'Report submitted successfully!',
          'data': data,
        };
      } else {
        print('❌ Failed with status: ${response.statusCode}');
        final errorData = jsonDecode(response.body);

        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to submit report',
        };
      }
    } catch (e) {
      print('❌ Error submitting report: $e');
      print('📍 Error Type: ${e.runtimeType}');

      String errorMessage = 'Failed to submit report. Please try again.';

      String errorString = e.toString().toLowerCase();

      if (errorString.contains('socketexception') ||
          errorString.contains('networkexception') ||
          errorString.contains('connection')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorString.contains('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (errorString.contains('formatexception')) {
        errorMessage = 'Invalid server response. Please contact support.';
      }

      return {
        'success': false,
        'message': errorMessage,
        'errorDetails': e.toString(),
      };
    }
  }

  /// Get all lost person reports for an event
  Future<Map<String, dynamic>> getLostPersons(String eventId) async {
    try {
      final url = Uri.parse('${Constants.baseUrl}/lost-persons/?event_id=$eventId');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to fetch reports',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to connect to server',
      };
    }
  }

  /// Get a specific lost person report
  Future<Map<String, dynamic>> getLostPerson(String reportId) async {
    try {
      final url = Uri.parse('${Constants.baseUrl}/lost-persons/$reportId');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to fetch report',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to connect to server',
      };
    }
  }
}
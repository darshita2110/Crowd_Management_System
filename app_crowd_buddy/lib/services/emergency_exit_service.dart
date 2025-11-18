import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/emergency_exit_model.dart';
import '../utils/constants.dart';

class EmergencyExitService {
  // Fetch emergency exits for specific event
  Future<List<EmergencyExit>> fetchExitsForEvent(String eventId) async {
    try {
      final url = Uri.parse(
          '${ApiConstants.baseUrl}/emergency-exits/?event_id=$eventId');
      print('🌐 Fetching Emergency Exits for Event: $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📥 Response Status Code: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final exits =
        jsonData.map((json) => EmergencyExit.fromJson(json)).toList();

        print('✅ Successfully fetched ${exits.length} emergency exits');
        return exits;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load emergency exits: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching emergency exits: $e');
    }
  }

  // Fetch all emergency exits
  Future<List<EmergencyExit>> fetchAllExits() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/emergency-exits/');
      print('🌐 Fetching All Emergency Exits: $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📥 Response Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final exits =
        jsonData.map((json) => EmergencyExit.fromJson(json)).toList();

        print('✅ Successfully fetched ${exits.length} emergency exits');
        return exits;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load emergency exits: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching emergency exits: $e');
    }
  }
}

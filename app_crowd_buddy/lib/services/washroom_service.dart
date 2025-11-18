import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/washroom_model.dart';
import '../utils/constants.dart';

class WashroomService {
  // Fetch washrooms for specific event
  Future<List<Washroom>> fetchWashroomsForEvent(String eventId) async {
    try {
      final url = Uri.parse(
          '${ApiConstants.baseUrl}/washroom-facilities/?event_id=$eventId');
      print('🌐 Fetching Washrooms for Event: $url');

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
        final washrooms =
        jsonData.map((json) => Washroom.fromJson(json)).toList();

        print('✅ Successfully fetched ${washrooms.length} washrooms');
        return washrooms;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load washrooms: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching washrooms: $e');
    }
  }

  // Fetch all washrooms (if needed)
  Future<List<Washroom>> fetchAllWashrooms() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/washroom-facilities/');
      print('🌐 Fetching All Washrooms: $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📥 Response Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final washrooms =
        jsonData.map((json) => Washroom.fromJson(json)).toList();

        print('✅ Successfully fetched ${washrooms.length} washrooms');
        return washrooms;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load washrooms: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching washrooms: $e');
    }
  }
}

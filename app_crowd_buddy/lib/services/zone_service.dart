import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/zone_model.dart';
import '../utils/constants.dart';

class ZoneService {
  // Fetch zones for specific event
  Future<List<Zone>> fetchZonesForEvent(String eventId) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/zones/?event_id=$eventId');
      print('🌐 Fetching Zones for Event: $url');

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
        final zones = jsonData.map((json) => Zone.fromJson(json)).toList();

        print('✅ Successfully fetched ${zones.length} zones');
        return zones;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load zones: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching zones: $e');
    }
  }

  // Fetch all zones
  Future<List<Zone>> fetchAllZones() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/zones/');
      print('🌐 Fetching All Zones: $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📥 Response Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final zones = jsonData.map((json) => Zone.fromJson(json)).toList();

        print('✅ Successfully fetched ${zones.length} zones');
        return zones;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load zones: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching zones: $e');
    }
  }
}

// pages/live_map_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveMapPage extends StatelessWidget {
  static const route = '/live-map';
  const LiveMapPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Crowd Map')),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(28.6139, 77.2090), // Example: Delhi
          initialZoom: 14.0,
          onTap: (tapPosition, point) {
            // 'point' is the LatLng where the user tapped
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                    'Reported issue at: ${point.latitude.toStringAsFixed(4)}, ${point.longitude.toStringAsFixed(4)}'
                ),
              ),
            );
            // You could also add a new temporary marker here
          },
        ),
        children: [
          // Layer 1: The Base Map
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.example.crowd_buddy', // !! USE YOURS !!
          ),
          MarkerLayer(
            markers: [
              // Simulated Hospital
              Marker(
                point: LatLng(28.6150, 77.2100),
                child: IconButton(
                  icon: const Icon(Icons.local_hospital, color: Colors.red, size: 30),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Simulated Hospital A')),
                    );
                  },
                ),
              ),
              // Simulated Exit
              Marker(
                point: LatLng(28.6140, 77.2090),
                child: IconButton(
                  icon: const Icon(Icons.exit_to_app, color: Colors.green, size: 30),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Simulated Exit B')),
                    );
                  },
                ),
              ),
            ],
          ),
          PolygonLayer(
            polygons: [
              Polygon(
                points: [
                  LatLng(28.6130, 77.2080),
                  LatLng(28.6130, 77.2100),
                  LatLng(28.6145, 77.2100),
                  LatLng(28.6145, 77.2080),
                ],
                color: Colors.blue.withOpacity(0.3),
                borderColor: Colors.blue,
                borderStrokeWidth: 2,
              ),
            ],
          ),

          // --- ADD THIS POLYLINE LAYER ---
          PolylineLayer(
            polylines: [
              Polyline(
                points: [
                  LatLng(28.6140, 77.2090), // From Exit B
                  LatLng(28.6142, 77.2085),
                  LatLng(28.6145, 77.2080), // To a "Safe Area"
                ],
                color: Colors.green,
                strokeWidth: 4,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
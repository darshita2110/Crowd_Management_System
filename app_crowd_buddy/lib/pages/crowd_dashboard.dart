import 'package:flutter/material.dart';
import '../widgets/density_meter.dart';
import '../widgets/section.dart';
import 'medical_help_page.dart';
import 'emergency_exit_page.dart';
import 'feedback_page.dart';
import 'lost_person_form.dart';
import 'alerts_page.dart';
import 'live_map_page.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
class CrowdDashboard extends StatelessWidget {
  static const route = '/dashboard';
  const CrowdDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crowd Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Section(
            title: 'Map View (Real-time Crowd Density)',
            child: SizedBox(
              height: 220,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                // Use a Stack to layer the tap detector ON TOP of the map
                child: Stack(
                  children: [
                    // --- Layer 1: The Map (bottom layer) ---
                    FlutterMap(
                      options: MapOptions(
                        initialCenter: LatLng(28.6139, 77.2090), // Example: Delhi
                        initialZoom: 13.0,
                        // Keep map non-interactive in the dashboard
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.drag | InteractiveFlag.pinchZoom,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          // !! IMPORTANT: Use your real package name !!
                          userAgentPackageName: 'com.example.crowd_buddy',
                        ),
                        CircleLayer(
                          circles: [
                            CircleMarker(
                              point: LatLng(28.6139, 77.2090), // Center of the event
                              radius: 200, // Radius in meters
                              useRadiusInMeter: true,
                              color: Colors.blue.withOpacity(0.2),
                              borderColor: Colors.blue,
                              borderStrokeWidth: 2,
                            ),
                          ],
                        ),
                      ],
                    ),

                    // --- Layer 2: The Click Detector (top layer) ---
                    GestureDetector(
                      onTap: () => Navigator.pushNamed(context, LiveMapPage.route),
                      // This transparent container ensures the detector fills the space
                      // and makes the whole area tappable.
                      child: Container(
                        color: Colors.transparent,
                        alignment: Alignment.bottomRight,
                        padding: const EdgeInsets.all(8),
                        child: const Icon(
                          Icons.fullscreen,
                          color: Colors.white70,
                          semanticLabel: 'Enlarge map',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Section(
            title: 'Quick Actions',
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                ActionChip(
                  avatar: const Icon(Icons.local_hospital_outlined),
                  label: const Text('Nearest Hospitals'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.wc_outlined),
                  label: const Text('Washrooms/Exits/Hotels'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.auto_graph_outlined),
                  label: const Text('Crowd Prediction'),
                  onPressed: () {},
                ),
              ],
            ),
          ),
          Section(
            title: 'Density Meter',
            child: const DensityMeter(level: 0.62),
          ),
          Section(
            title: 'Emergency',
            child: Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => Navigator.pushNamed(context, MedicalHelpPage.route),
                    icon: const Icon(Icons.health_and_safety),
                    label: const Text('Medical Help'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(context, EmergencyExitPage.route),
                    icon: const Icon(Icons.exit_to_app),
                    label: const Text('Safe Exit'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.feedback_outlined), label: 'Feedback'),
          NavigationDestination(icon: Icon(Icons.person_search_outlined), label: 'Lost'),
          NavigationDestination(icon: Icon(Icons.notifications_active_outlined), label: 'Alerts'),
        ],
        onDestinationSelected: (i) {
          if (i == 0) Navigator.pushNamed(context, FeedbackPage.route);
          if (i == 1) Navigator.pushNamed(context, LostPersonForm.route);
          if (i == 2) Navigator.pushNamed(context, AlertsPage.route);
        },
        selectedIndex: 2,
      ),
    );
  }
}

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

class CrowdDashboard extends StatefulWidget {
  static const route = '/dashboard';
  const CrowdDashboard({super.key});

  @override
  State<CrowdDashboard> createState() => _CrowdDashboardState();
}

class _CrowdDashboardState extends State<CrowdDashboard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Gradient AppBar
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'Event Dashboard',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                      Colors.teal.shade900,
                      Colors.teal.shade700,
                      Colors.cyan.shade800,
                    ]
                        : [
                      Colors.teal.shade400,
                      Colors.teal.shade600,
                      Colors.cyan.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: FadeTransition(
              opacity: _animationController,
              child: ListView(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  // Map View Section
                  Section(
                    title: 'Live Crowd Map',
                    icon: Icons.map_outlined,
                    onMorePressed: () =>
                        Navigator.pushNamed(context, LiveMapPage.route),
                    child: Container(
                      height: 220,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.teal.withOpacity(0.2),
                            blurRadius: 15,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Stack(
                          children: [
                            FlutterMap(
                              options: MapOptions(
                                initialCenter: LatLng(28.6139, 77.2090),
                                initialZoom: 13.0,
                                interactionOptions: const InteractionOptions(
                                  flags: InteractiveFlag.drag |
                                  InteractiveFlag.pinchZoom,
                                ),
                              ),
                              children: [
                                TileLayer(
                                  urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                  userAgentPackageName: 'com.example.crowd_buddy',
                                ),
                                CircleLayer(
                                  circles: [
                                    CircleMarker(
                                      point: LatLng(28.6139, 77.2090),
                                      radius: 200,
                                      useRadiusInMeter: true,
                                      color: Colors.blue.withOpacity(0.2),
                                      borderColor: Colors.blue,
                                      borderStrokeWidth: 2,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(
                                  context, LiveMapPage.route),
                              child: Container(
                                color: Colors.transparent,
                                alignment: Alignment.bottomRight,
                                padding: const EdgeInsets.all(12),
                                child: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.6),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.fullscreen,
                                          color: Colors.white, size: 20),
                                      SizedBox(width: 4),
                                      Text(
                                        'Expand',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),



                  // Density Meter Section
                  Section(
                    title: 'Current Status',
                    icon: Icons.people_outline,
                    child: const DensityMeter(level: 0.62),
                  ),

                  // Emergency Actions Section
                  Section(
                    title: 'Emergency',
                    icon: Icons.warning_amber_rounded,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _buildEmergencyButton(
                                context,
                                Icons.health_and_safety,
                                'Medical Help',
                                [Colors.red.shade400, Colors.red.shade600],
                                    () => Navigator.pushNamed(
                                    context, MedicalHelpPage.route),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildEmergencyButton(
                                context,
                                Icons.exit_to_app,
                                'Safe Exit',
                                [Colors.green.shade400, Colors.green.shade600],
                                    () => Navigator.pushNamed(
                                    context, EmergencyExitPage.route),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (i) {
            setState(() {
              _selectedIndex = i;
            });
            if (i == 0) Navigator.pushNamed(context, FeedbackPage.route);
            if (i == 1) Navigator.pushNamed(context, LostPersonForm.route);
            if (i == 2) Navigator.pushNamed(context, AlertsPage.route);
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.feedback_outlined),
              selectedIcon: Icon(Icons.feedback),
              label: 'Feedback',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_search_outlined),
              selectedIcon: Icon(Icons.person_search),
              label: 'Lost & Found',
            ),
            NavigationDestination(
              icon: Icon(Icons.notifications_outlined),
              selectedIcon: Icon(Icons.notifications),
              label: 'Alerts',
            ),
          ],
        ),
      ),
    );
  }



  Widget _buildEmergencyButton(
      BuildContext context,
      IconData icon,
      String label,
      List<Color> colors,
      VoidCallback onPressed,
      ) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colors),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: colors[0].withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              children: [
                Icon(icon, color: Colors.white, size: 32),
                const SizedBox(height: 8),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
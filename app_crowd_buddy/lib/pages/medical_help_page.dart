import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart'; // Needed for opening maps and dialer

class MedicalHelpPage extends StatefulWidget {
  static const route = '/medical';
  const MedicalHelpPage({super.key});

  @override
  State<MedicalHelpPage> createState() => _MedicalHelpPageState();
}

class _MedicalHelpPageState extends State<MedicalHelpPage> {
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
                'Medical Help',
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
                      Colors.red.shade900,
                      Colors.red.shade700,
                      Colors.pink.shade800,
                    ]
                        : [
                      Colors.red.shade400,
                      Colors.red.shade600,
                      Colors.pink.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // INFO CARD REMOVED

                  // LOCATION AND SOS REMOVED

                  // Nearby Facilities
                  Text(
                    'Nearby Medical Facilities',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildFacilityCard(
                    context,
                    name: 'City Hospital',
                    distance: '0.5 km away',
                    phone: '+91 99999 00000',
                    address: 'City Hospital, New Delhi',
                    icon: Icons.local_hospital,
                    color: Colors.blue,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildFacilityCard(
                    context,
                    name: 'Medical Center',
                    distance: '1.2 km away',
                    phone: '+91 88888 77777',
                    address: 'Medical Center, New Delhi',
                    icon: Icons.medical_services,
                    color: Colors.purple,
                    isDark: isDark,
                  ),

                  const SizedBox(height: 32),

                  // Emergency Contacts
                  Text(
                    'Emergency Contacts',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildContactCard(
                    context,
                    name: 'Ambulance',
                    number: '108',
                    icon: Icons.emergency,
                    color: Colors.red,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 12),
                  _buildContactCard(
                    context,
                    name: 'Event Medical Team',
                    number: '+91 98765 43210',
                    icon: Icons.phone,
                    color: Colors.green,
                    isDark: isDark,
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Facilitiy Card with map and phone integration
  Widget _buildFacilityCard(
      BuildContext context, {
        required String name,
        required String distance,
        required String phone,
        required String address,
        required IconData icon,
        required Color color,
        required bool isDark,
      }) {
    final theme = Theme.of(context);

    // Retrieve Maps url with place name or address
    String mapUrl =
    Uri.encodeFull('https://www.google.com/maps/search/?api=1&query=$address');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          colors: isDark
              ? [
            color.withOpacity(0.2),
            color.withOpacity(0.1),
          ]
              : [
            color.withOpacity(0.1),
            color.withOpacity(0.05),
          ],
        ),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  distance,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () async {
                    final uri = Uri.parse('tel:$phone');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri);
                    }
                  },
                  child: Text(
                    phone,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: color,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // This IconButton handles opening Google Maps
          IconButton(
            icon: Icon(Icons.directions, color: color), // The "arrow" icon
            onPressed: () async {
              final uri = Uri.parse(mapUrl);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
        ],
      ),
    );
  }

  // Contact Card with call integration
  Widget _buildContactCard(
      BuildContext context, {
        required String name,
        required String number,
        required IconData icon,
        required Color color,
        required bool isDark,
      }) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          colors: isDark
              ? [
            color.withOpacity(0.2),
            color.withOpacity(0.1),
          ]
              : [
            color.withOpacity(0.1),
            color.withOpacity(0.05),
          ],
        ),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  number,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          // This IconButton handles opening the dialer
          IconButton(
            icon: Icon(Icons.call, color: color), // The "phone" icon
            onPressed: () async {
              final uri = Uri.parse('tel:$number');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              }
            },
          ),
        ],
      ),
    );
  }
}
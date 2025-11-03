import 'package:flutter/material.dart';
import '../pages/medical_help_page.dart';
import '../pages/live_map_page.dart';
import '../pages/lost_person_form.dart';
import '../pages/alerts_page.dart';

class QuickTilesRow extends StatelessWidget {
  const QuickTilesRow({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final tiles = [
      {
        'icon': Icons.emergency_outlined,
        'label': 'Emergency',
        'colors': [Colors.red.shade400, Colors.red.shade600],
        'route': MedicalHelpPage.route,
      },
      {
        'icon': Icons.map_outlined,
        'label': 'Live Map',
        'colors': [Colors.blue.shade400, Colors.blue.shade600],
        'route': LiveMapPage.route,
      },
      {
        'icon': Icons.person_search_outlined,
        'label': 'Lost & Found',
        'colors': [Colors.orange.shade400, Colors.orange.shade600],
        'route': LostPersonForm.route,
      },
      {
        'icon': Icons.notifications_active_outlined,
        'label': 'Alerts',
        'colors': [Colors.purple.shade400, Colors.purple.shade600],
        'route': AlertsPage.route,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 24,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.teal, Colors.cyan],
                ),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Quick Actions',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: tiles.length,
          itemBuilder: (context, index) {
            return _buildQuickTile(
              context,
              tiles[index]['icon'] as IconData,
              tiles[index]['label'] as String,
              tiles[index]['colors'] as List<Color>,
              tiles[index]['route'] as String,
              index,
              isDark,
            );
          },
        ),
      ],
    );
  }

  Widget _buildQuickTile(
      BuildContext context,
      IconData icon,
      String label,
      List<Color> colors,
      String route,
      int index,
      bool isDark,
      ) {
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 400 + (index * 100)),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [
              colors[0].withOpacity(0.3),
              colors[1].withOpacity(0.2),
            ]
                : [
              colors[0].withOpacity(0.1),
              colors[1].withOpacity(0.05),
            ],
          ),
          border: Border.all(
            color: colors[0].withOpacity(0.3),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: colors[0].withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              Navigator.pushNamed(context, route);
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: colors,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: colors[0].withOpacity(0.4),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(
                    icon,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: colors[0],
                    letterSpacing: 0.3,
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
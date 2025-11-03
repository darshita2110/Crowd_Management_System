import 'package:flutter/material.dart';
import 'dart:math' as math;

class DensityMeter extends StatefulWidget {
  final double level; // 0.0 to 1.0

  const DensityMeter({super.key, required this.level});

  @override
  State<DensityMeter> createState() => _DensityMeterState();
}

class _DensityMeterState extends State<DensityMeter>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0.0, end: widget.level).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOutCubic,
      ),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Color _getLevelColor(double level) {
    if (level < 0.4) return Colors.green;
    if (level < 0.7) return Colors.orange;
    return Colors.red;
  }

  String _getLevelText(double level) {
    if (level < 0.4) return 'Low Density';
    if (level < 0.7) return 'Medium Density';
    return 'High Density';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [
            Colors.teal.shade900.withOpacity(0.3),
            Colors.cyan.shade900.withOpacity(0.2),
          ]
              : [
            Colors.teal.shade50,
            Colors.cyan.shade50,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.teal.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Crowd Density',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  AnimatedBuilder(
                    animation: _animation,
                    builder: (context, child) {
                      return Text(
                        _getLevelText(_animation.value),
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: _getLevelColor(_animation.value),
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    },
                  ),
                ],
              ),
              AnimatedBuilder(
                animation: _animation,
                builder: (context, child) {
                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getLevelColor(_animation.value).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${(_animation.value * 100).toInt()}%',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: _getLevelColor(_animation.value),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Animated Progress Bar
          AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              return Column(
                children: [
                  Stack(
                    children: [
                      // Background
                      Container(
                        height: 16,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: theme.colorScheme.outline.withOpacity(0.2),
                          ),
                        ),
                      ),
                      // Progress with gradient
                      FractionallySizedBox(
                        widthFactor: _animation.value,
                        child: Container(
                          height: 16,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                _getLevelColor(_animation.value),
                                _getLevelColor(_animation.value).withOpacity(0.7),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: _getLevelColor(_animation.value)
                                    .withOpacity(0.4),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Level indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildIndicator('Low', Colors.green, _animation.value < 0.4),
                      _buildIndicator('Medium', Colors.orange,
                          _animation.value >= 0.4 && _animation.value < 0.7),
                      _buildIndicator('High', Colors.red, _animation.value >= 0.7),
                    ],
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          // People count animation
          AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.people,
                    color: _getLevelColor(_animation.value),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${(_animation.value * 5000).toInt()} people in area',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIndicator(String label, Color color, bool isActive) {
    return Column(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: isActive ? color : color.withOpacity(0.3),
            shape: BoxShape.circle,
            boxShadow: isActive
                ? [
              BoxShadow(
                color: color.withOpacity(0.5),
                blurRadius: 8,
                spreadRadius: 2,
              ),
            ]
                : null,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? color : color.withOpacity(0.5),
          ),
        ),
      ],
    );
  }
}
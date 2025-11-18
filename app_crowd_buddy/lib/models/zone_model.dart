class Zone {
  final String id;
  final String eventId;
  final String name;
  final int capacity;
  final int currentDensity;
  final String densityStatus;
  final String? imageUrl;
  final DateTime lastUpdated;
  final DateTime createdAt;

  Zone({
    required this.id,
    required this.eventId,
    required this.name,
    required this.capacity,
    required this.currentDensity,
    required this.densityStatus,
    this.imageUrl,
    required this.lastUpdated,
    required this.createdAt,
  });

  factory Zone.fromJson(Map<String, dynamic> json) {
    return Zone(
      id: json['id'] ?? '',
      eventId: json['event_id'] ?? '',
      name: json['name'] ?? '',
      capacity: json['capacity'] ?? 0,
      currentDensity: json['current_density'] ?? 0,
      densityStatus: json['density_status'] ?? '',
      imageUrl: json['image_url'],
      lastUpdated: DateTime.parse(json['last_updated']),
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'name': name,
      'capacity': capacity,
      'current_density': currentDensity,
      'density_status': densityStatus,
      'image_url': imageUrl,
      'last_updated': lastUpdated.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  // Helper to get occupancy percentage
  double get occupancyPercentage {
    if (capacity == 0) return 0;
    return (currentDensity / capacity * 100).clamp(0, 100);
  }

  // Helper to check if crowded
  bool get isCrowded => densityStatus.toLowerCase() == 'crowded';

  // Helper to get display name (capitalize)
  String get displayName {
    return name.split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }
}

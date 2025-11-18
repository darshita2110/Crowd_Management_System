class EmergencyExit {
  final String id;
  final String eventId;
  final String exitName;
  final String location;
  final String status;
  final DateTime lastUpdated;
  final DateTime createdAt;

  EmergencyExit({
    required this.id,
    required this.eventId,
    required this.exitName,
    required this.location,
    required this.status,
    required this.lastUpdated,
    required this.createdAt,
  });

  factory EmergencyExit.fromJson(Map<String, dynamic> json) {
    return EmergencyExit(
      id: json['id'] ?? '',
      eventId: json['event_id'] ?? '',
      exitName: json['exit_name'] ?? '',
      location: json['location'] ?? '',
      status: json['status'] ?? '',
      lastUpdated: DateTime.parse(json['last_updated']),
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'exit_name': exitName,
      'location': location,
      'status': status,
      'last_updated': lastUpdated.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  // Helper to check if exit is clear
  bool get isClear => status.toLowerCase() == 'clear';

  // Helper to get status display
  String get statusDisplay {
    switch (status.toLowerCase()) {
      case 'clear':
        return 'Clear';
      case 'blocked':
        return 'Blocked';
      case 'crowded':
        return 'Crowded';
      default:
        return status;
    }
  }
}

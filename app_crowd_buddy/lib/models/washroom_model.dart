class Washroom {
  final String id;
  final String eventId;
  final String name;
  final String gender;
  final String floorLevel;
  final int capacity;
  final String availabilityStatus;
  final String locationDetails;
  final DateTime createdAt;
  final DateTime updatedAt;

  Washroom({
    required this.id,
    required this.eventId,
    required this.name,
    required this.gender,
    required this.floorLevel,
    required this.capacity,
    required this.availabilityStatus,
    required this.locationDetails,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Washroom.fromJson(Map<String, dynamic> json) {
    return Washroom(
      id: json['id'] ?? '',
      eventId: json['event_id'] ?? '',
      name: json['name'] ?? '',
      gender: json['gender'] ?? '',
      floorLevel: json['floor_level'] ?? '',
      capacity: json['capacity'] ?? 0,
      availabilityStatus: json['availability_status'] ?? '',
      locationDetails: json['location_details'] ?? '',
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'name': name,
      'gender': gender,
      'floor_level': floorLevel,
      'capacity': capacity,
      'availability_status': availabilityStatus,
      'location_details': locationDetails,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Helper to get gender display text
  String get genderDisplay {
    switch (gender.toLowerCase()) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'unisex':
        return 'Unisex';
      default:
        return 'Both';
    }
  }

  // Helper to check if available
  bool get isAvailable => availabilityStatus.toLowerCase() == 'available';
}

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/lost_person_service.dart';

class LostPersonForm extends StatefulWidget {
  static const route = '/lost';
  final String? eventId; // Pass event ID when navigating to this page

  const LostPersonForm({super.key, this.eventId});

  @override
  State<LostPersonForm> createState() => _LostPersonFormState();
}

class _LostPersonFormState extends State<LostPersonForm> {
  final _formKey = GlobalKey<FormState>();
  final _lostPersonName = TextEditingController();
  final _age = TextEditingController();
  final _desc = TextEditingController();
  final _reporterName = TextEditingController();
  final _contactNumber = TextEditingController();
  final _lastSeenLocation = TextEditingController();
  final _lostPersonService = LostPersonService();

  ImageProvider? _photo;
  String _gender = 'Male';
  TimeOfDay? _lastSeenTime;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    // Pre-fill reporter name from Firebase Auth
    final user = FirebaseAuth.instance.currentUser;
    if (user != null && user.displayName != null) {
      _reporterName.text = user.displayName!;
    }
  }

  @override
  void dispose() {
    _lostPersonName.dispose();
    _age.dispose();
    _desc.dispose();
    _reporterName.dispose();
    _contactNumber.dispose();
    _lastSeenLocation.dispose();
    super.dispose();
  }

  Future<void> _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _lastSeenTime ?? TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Colors.orange,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _lastSeenTime = picked;
      });
    }
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.period == DayPeriod.am ? 'AM' : 'PM';
    return '${hour == 0 ? 12 : hour}:$minute $period';
  }

  String _formatTimeForAPI(TimeOfDay time) {
    // Format as HH:MM (24-hour format)
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;

    if (_lastSeenTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: const [
              Icon(Icons.warning, color: Colors.white),
              SizedBox(width: 12),
              Text('Please select last seen time'),
            ],
          ),
          backgroundColor: Colors.orange,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Get current user ID from Firebase
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        throw Exception('User not logged in');
      }

      // Get event ID (you might want to pass this from previous screen)
      final eventId = widget.eventId ?? ''; // Use empty string or get from storage

      // Submit the report
      final result = await _lostPersonService.submitReport(
        reporterId: user.uid,
        reporterName: _reporterName.text.trim(),
        reporterContact: _contactNumber.text.trim(),
        personName: _lostPersonName.text.trim(),
        age: int.parse(_age.text.trim()),
        gender: _gender,
        description: _desc.text.trim().isEmpty
            ? 'No description provided'
            : _desc.text.trim(),
        lastSeenLocation: _lastSeenLocation.text.trim(),
        lastSeenTime: _formatTimeForAPI(_lastSeenTime!),
        eventId: eventId,
      );

      if (mounted) {
        if (result['success']) {
          final reportData = result['data'];
          final reportId = reportData['id'];

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Report submitted successfully!'),
                        Text(
                          'Report ID: $reportId',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 4),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.white),
                  const SizedBox(width: 12),
                  Expanded(child: Text(result['message'])),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: Colors.white),
                const SizedBox(width: 12),
                Expanded(child: Text('Error: ${e.toString()}')),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
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
                'Lost Person Report',
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
                      Colors.orange.shade900,
                      Colors.orange.shade700,
                      Colors.deepOrange.shade800,
                    ]
                        : [
                      Colors.orange.shade400,
                      Colors.orange.shade600,
                      Colors.deepOrange.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Form(
              key: _formKey,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Photo Upload Section
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isDark
                                ? [
                              Colors.orange.shade900.withOpacity(0.3),
                              Colors.deepOrange.shade900
                                  .withOpacity(0.2),
                            ]
                                : [
                              Colors.orange.shade50,
                              Colors.deepOrange.shade50,
                            ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.orange.withOpacity(0.2),
                              blurRadius: 15,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Stack(
                              children: [
                                Container(
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.orange.shade300,
                                        Colors.deepOrange.shade400,
                                      ],
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.orange.withOpacity(0.4),
                                        blurRadius: 15,
                                        offset: const Offset(0, 6),
                                      ),
                                    ],
                                  ),
                                  child: CircleAvatar(
                                    radius: 60,
                                    backgroundImage: _photo,
                                    backgroundColor: Colors.transparent,
                                    child: _photo == null
                                        ? const Icon(Icons.person,
                                        size: 60, color: Colors.white)
                                        : null,
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  bottom: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.orange.shade600,
                                          Colors.deepOrange.shade600,
                                        ],
                                      ),
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color:
                                          Colors.orange.withOpacity(0.5),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            OutlinedButton.icon(
                              onPressed: () async {
                                // TODO: integrate image_picker
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Photo upload coming soon!'),
                                    duration: Duration(seconds: 2),
                                  ),
                                );
                              },
                              icon: const Icon(Icons.photo_camera_outlined),
                              label: const Text('Upload Photo'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.orange,
                                side: const BorderSide(color: Colors.orange),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Reporter Information Section
                    _buildSectionHeader('Reporter Information', theme),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _reporterName,
                      label: 'Your Name (Reporter)',
                      icon: Icons.person_outline,
                      validator: _req,
                      isDark: isDark,
                      hint: 'Enter your name',
                    ),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _contactNumber,
                      label: 'Contact Number',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Contact number is required';
                        }
                        if (value.length < 10) {
                          return 'Enter a valid phone number';
                        }
                        return null;
                      },
                      isDark: isDark,
                      hint: 'Enter contact number',
                    ),

                    const SizedBox(height: 32),

                    // Lost Person Information Section
                    _buildSectionHeader('Lost Person Details', theme),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _lostPersonName,
                      label: 'Lost Person Name',
                      icon: Icons.person_search,
                      validator: _req,
                      isDark: isDark,
                      hint: 'Enter lost person\'s name',
                    ),
                    const SizedBox(height: 16),

                    // Age and Gender Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            controller: _age,
                            label: 'Age',
                            icon: Icons.cake_outlined,
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Age is required';
                              }
                              final age = int.tryParse(value);
                              if (age == null || age < 0 || age > 150) {
                                return 'Enter valid age';
                              }
                              return null;
                            },
                            isDark: isDark,
                            hint: 'Age',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              gradient: LinearGradient(
                                colors: isDark
                                    ? [
                                  Colors.orange.shade900
                                      .withOpacity(0.2),
                                  Colors.deepOrange.shade900
                                      .withOpacity(0.1),
                                ]
                                    : [
                                  Colors.orange.shade50,
                                  Colors.deepOrange.shade50,
                                ],
                              ),
                            ),
                            child: DropdownButtonFormField<String>(
                              value: _gender,
                              decoration: InputDecoration(
                                labelText: 'Gender',
                                prefixIcon: const Icon(Icons.wc,
                                    color: Colors.orange),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none,
                                ),
                                filled: true,
                                fillColor: Colors.transparent,
                              ),
                              items: ['Male', 'Female', 'Other']
                                  .map((g) => DropdownMenuItem(
                                value: g,
                                child: Text(g),
                              ))
                                  .toList(),
                              onChanged: (val) {
                                setState(() {
                                  _gender = val!;
                                });
                              },
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _desc,
                      label: 'Clothing/Physical Description',
                      icon: Icons.description_outlined,
                      maxLines: 4,
                      isDark: isDark,
                      hint: 'Describe clothing, appearance, distinctive features...',
                    ),

                    const SizedBox(height: 32),

                    // Last Seen Information Section
                    _buildSectionHeader('Last Seen Details', theme),
                    const SizedBox(height: 16),

                    _buildTextField(
                      controller: _lastSeenLocation,
                      label: 'Last Seen Location',
                      icon: Icons.location_on_outlined,
                      validator: _req,
                      isDark: isDark,
                      hint: 'E.g., Near Gate A, Food Court, Main Stage...',
                    ),

                    const SizedBox(height: 16),

                    // Last Seen Time
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          colors: isDark
                              ? [
                            Colors.orange.shade900.withOpacity(0.2),
                            Colors.deepOrange.shade900
                                .withOpacity(0.1),
                          ]
                              : [
                            Colors.orange.shade50,
                            Colors.deepOrange.shade50,
                          ],
                        ),
                      ),
                      child: InkWell(
                        onTap: _selectTime,
                        borderRadius: BorderRadius.circular(12),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Last Seen Time',
                            prefixIcon: const Icon(Icons.access_time,
                                color: Colors.orange),
                            suffixIcon: const Icon(Icons.arrow_drop_down,
                                color: Colors.orange),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            filled: true,
                            fillColor: Colors.transparent,
                          ),
                          child: Text(
                            _lastSeenTime != null
                                ? _formatTime(_lastSeenTime!)
                                : 'Select time',
                            style: TextStyle(
                              color: _lastSeenTime != null
                                  ? theme.textTheme.bodyLarge?.color
                                  : theme.colorScheme.onSurface
                                  .withOpacity(0.5),
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Important Note
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.orange.withOpacity(0.1),
                        border: Border.all(
                          color: Colors.orange.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline,
                              color: Colors.orange, size: 24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'This report will be immediately sent to event security and staff.',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: Colors.orange.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Submit Button
                    Container(
                      width: double.infinity,
                      height: 56,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: LinearGradient(
                          colors: [
                            Colors.orange.shade600,
                            Colors.deepOrange.shade600,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.orange.withOpacity(0.4),
                            blurRadius: 15,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: _isSubmitting ? null : _submitReport,
                          child: Center(
                            child: _isSubmitting
                                ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                                : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.send, color: Colors.white),
                                SizedBox(width: 12),
                                Text(
                                  'Submit Report',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, ThemeData theme) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 24,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Colors.orange, Colors.deepOrange],
            ),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool isDark,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? hint,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          colors: isDark
              ? [
            Colors.orange.shade900.withOpacity(0.2),
            Colors.deepOrange.shade900.withOpacity(0.1),
          ]
              : [
            Colors.orange.shade50,
            Colors.deepOrange.shade50,
          ],
        ),
      ),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: Colors.orange),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.transparent,
        ),
        validator: validator,
        keyboardType: keyboardType,
        maxLines: maxLines,
      ),
    );
  }

  String? _req(String? v) =>
      (v == null || v.trim().isEmpty) ? 'This field is required' : null;
}
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../controllers/auth_controller.dart';
import '../../controllers/user_controller.dart';
import '../../controllers/booking_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/loading_button.dart';
import '../../core/widgets/status_badge.dart';
import '../../routes/app_routes.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  final UserController _userCtrl = Get.find<UserController>();
  final AuthController _authCtrl = Get.find<AuthController>();
  final BookingController _bookingCtrl = Get.find<BookingController>();

  final _nameCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  File? _selectedImage;
  bool _editMode = false;

  @override
  void initState() {
    super.initState();

    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final uid = _authCtrl.user.value?.id;
      if (uid != null) {
        _userCtrl.fetchProfile(uid).then((_) => _syncFormToProfile());
        _bookingCtrl.fetchUserBookings();
      }
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  void _syncFormToProfile() {
    final user = _userCtrl.profile.value;
    if (user != null && mounted) {
      setState(() {
        _nameCtrl.text = user.name;
      });
    }
  }

  Future<void> _pickImage() async {
    try {
      final picked = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
        requestFullMetadata: false,
      );
      if (picked != null && mounted) {
        setState(() => _selectedImage = File(picked.path));
      }
    } catch (e) {
      if (mounted) {
        Get.snackbar(
          'Permission Required',
          'Please allow photo access in your device settings.',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    }
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final user = _userCtrl.profile.value ?? _authCtrl.user.value;
    if (user == null) return;

    final ok = await _userCtrl.updateProfile(
      userId: user.id,
      name: _nameCtrl.text.trim(),
      imagePath: _selectedImage?.path,
    );

    if (ok && mounted) {
      setState(() {
        _editMode = false;
        _selectedImage = null;
      });
    }
  }

  void _logout() {
    Get.dialog(
      Dialog(
        backgroundColor: AppTheme.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 🔥 Changed to gold theme
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppTheme.gold.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(Icons.logout_rounded, color: AppTheme.gold, size: 26),
              ),
              const SizedBox(height: 16),
              const Text(
                'Sign Out',
                style: TextStyle(
                    color: AppTheme.cream,
                    fontSize: 18,
                    fontWeight: FontWeight.w700
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Are you sure you want to sign out?',
                style: TextStyle(color: AppTheme.muted, fontSize: 14),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.muted,
                        side: const BorderSide(color: AppTheme.border),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)
                        ),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Get.back();
                        _authCtrl.logout();
                      },
                      // 🔥 Changed to gold theme
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.gold,
                        foregroundColor: AppTheme.bg,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text(
                        'Sign Out',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: AnimatedPage(
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(child: _header()),
              SliverToBoxAdapter(child: _avatarSection()),
              SliverToBoxAdapter(child: _statsRow()),
              SliverToBoxAdapter(child: _editSection()),
              SliverToBoxAdapter(child: _infoTiles()),
              SliverToBoxAdapter(child: _recentBookings()),
              SliverToBoxAdapter(child: _dangerZone()),
              const SliverToBoxAdapter(child: SizedBox(height: 48)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _header() => Padding(
    padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const CustomBackButton(),
        const Text(
          'Profile',
          style: TextStyle(
              color: AppTheme.cream,
              fontSize: 16,
              fontWeight: FontWeight.w700
          ),
        ),
        GestureDetector(
          onTap: () => setState(() {
            _editMode = !_editMode;
            if (!_editMode) _selectedImage = null;
          }),
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: _editMode ? AppTheme.gold.withOpacity(0.15) : AppTheme.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: _editMode ? AppTheme.gold.withOpacity(0.4) : AppTheme.border
              ),
            ),
            child: Icon(
              _editMode ? Icons.close_rounded : Icons.edit_outlined,
              color: _editMode ? AppTheme.gold : AppTheme.muted,
              size: 18,
            ),
          ),
        ),
      ],
    ),
  );

  Widget _avatarSection() => Obx(() {
    final user = _userCtrl.profile.value ?? _authCtrl.user.value;
    final imageUrl = user?.image ?? '';

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 0),
      child: Column(
        children: [
          Center(
            child: Stack(
              children: [
                Container(
                  width: 102,
                  height: 102,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [AppTheme.gold.withOpacity(0.6), AppTheme.gold.withOpacity(0.2)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(2),
                    child: ClipOval(
                      child: _selectedImage != null
                          ? Image.file(_selectedImage!, fit: BoxFit.cover)
                          : imageUrl.isNotEmpty
                          ? Image.network(
                          imageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, __) => _avatarFallback(user?.name ?? '')
                      )
                          : _avatarFallback(user?.name ?? ''),
                    ),
                  ),
                ),
                if (_editMode)
                  Positioned(
                    bottom: 2,
                    right: 2,
                    child: GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: AppTheme.gold,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.bg, width: 2),
                        ),
                        child: const Icon(
                            Icons.camera_alt_rounded,
                            size: 14,
                            color: AppTheme.bg
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Text(
            user?.name ?? '—',
            style: const TextStyle(
                color: AppTheme.cream,
                fontSize: 22,
                fontWeight: FontWeight.w800
            ),
          ),
          const SizedBox(height: 4),
          Text(
            user?.email ?? '—',
            style: const TextStyle(color: AppTheme.muted, fontSize: 13),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: user?.role == 'admin'
                  ? AppTheme.gold.withOpacity(0.12)
                  : AppTheme.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: user?.role == 'admin'
                    ? AppTheme.gold.withOpacity(0.4)
                    : AppTheme.border,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  user?.role == 'admin'
                      ? Icons.shield_outlined
                      : Icons.person_outline_rounded,
                  size: 12,
                  color: user?.role == 'admin' ? AppTheme.gold : AppTheme.muted,
                ),
                const SizedBox(width: 5),
                Text(
                  (user?.role ?? 'user').toUpperCase(),
                  style: TextStyle(
                    color: user?.role == 'admin' ? AppTheme.gold : AppTheme.muted,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  });

  Widget _avatarFallback(String name) => Container(
    color: AppTheme.card,
    child: Center(
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : '?',
        style: const TextStyle(
            color: AppTheme.gold,
            fontSize: 36,
            fontWeight: FontWeight.w800
        ),
      ),
    ),
  );

  Widget _statsRow() => Obx(() {
    final bookings = _bookingCtrl.bookings;
    final total = bookings.length;
    final confirmed = bookings.where((b) => b.status == 'confirmed').length;
    final flights = bookings.where((b) => b.type == 'flight').length;
    final hotels = bookings.where((b) => b.type == 'hotel').length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppTheme.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          children: [
            _statCell('$total', 'Bookings'),
            _divider(),
            _statCell('$confirmed', 'Confirmed'),
            _divider(),
            _statCell('$flights', 'Flights'),
            _divider(),
            _statCell('$hotels', 'Hotels'),
          ],
        ),
      ),
    );
  });

  Widget _statCell(String value, String label) => Expanded(
    child: Column(
      children: [
        Text(
          value,
          style: const TextStyle(
              color: AppTheme.goldLt,
              fontSize: 20,
              fontWeight: FontWeight.w800
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: AppTheme.muted, fontSize: 11),
        ),
      ],
    ),
  );

  Widget _divider() => Container(width: 1, height: 32, color: AppTheme.border);

  Widget _editSection() => AnimatedSwitcher(
    duration: const Duration(milliseconds: 300),
    transitionBuilder: (child, anim) => SizeTransition(sizeFactor: anim, child: child),
    child: _editMode
        ? Padding(
      key: const ValueKey('edit'),
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'EDIT PROFILE',
              style: TextStyle(
                color: AppTheme.muted,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _nameCtrl,
              style: const TextStyle(color: AppTheme.cream, fontSize: 14),
              cursorColor: AppTheme.gold,
              textCapitalization: TextCapitalization.words,
              validator: (v) => (v == null || v.isEmpty) ? 'Name is required' : null,
              decoration: AppTheme.inputDecoration(
                label: 'Full Name',
                icon: Icons.person_outline_rounded,
              ),
            ),
            const SizedBox(height: 12),
            if (_selectedImage != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.gold.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.gold.withOpacity(0.25)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.image_outlined, color: AppTheme.gold, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _selectedImage!.path.split('/').last,
                        style: const TextStyle(color: AppTheme.gold, fontSize: 12),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() => _selectedImage = null),
                      child: const Icon(Icons.close_rounded, color: AppTheme.muted, size: 16),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),
            LoadingButton(
              onPressed: _save,
              text: 'Save Changes',
              isLoading: _userCtrl.isLoading,
            ),
          ],
        ),
      ),
    )
        : const SizedBox.shrink(key: ValueKey('no-edit')),
  );

  Widget _infoTiles() => Obx(() {
    final user = _userCtrl.profile.value ?? _authCtrl.user.value;
    if (user == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'ACCOUNT DETAILS',
            style: TextStyle(
              color: AppTheme.muted,
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            decoration: BoxDecoration(
              color: AppTheme.card,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                _infoTile(Icons.mail_outline_rounded, 'Email', user.email),
                _tileDivider(),
                _infoTile(Icons.shield_outlined, 'Role',
                    user.role[0].toUpperCase() + user.role.substring(1)),
                _tileDivider(),
                _infoTile(Icons.fingerprint_rounded, 'User ID',
                    user.id.length > 12 ? '…${user.id.substring(user.id.length - 12)}' : user.id),
              ],
            ),
          ),
        ],
      ),
    );
  });

  Widget _infoTile(IconData icon, String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    child: Row(
      children: [
        Icon(icon, color: AppTheme.muted, size: 18),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: AppTheme.muted, fontSize: 13)),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(
              color: AppTheme.cream,
              fontSize: 13,
              fontWeight: FontWeight.w600
          ),
        ),
      ],
    ),
  );

  Widget _tileDivider() => const Divider(height: 1, color: AppTheme.border, indent: 46);

  Widget _recentBookings() => Obx(() {
    final list = _bookingCtrl.bookings.take(3).toList();
    if (list.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'RECENT BOOKINGS',
                style: TextStyle(
                  color: AppTheme.muted,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
              GestureDetector(
                onTap: () => Get.toNamed(AppRoutes.bookingHistory),
                child: const Row(
                  children: [
                    Text(
                      'See all',
                      style: TextStyle(
                          color: AppTheme.gold,
                          fontSize: 12,
                          fontWeight: FontWeight.w600
                      ),
                    ),
                    SizedBox(width: 3),
                    Icon(Icons.arrow_forward_ios_rounded, color: AppTheme.gold, size: 10),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...list.map((b) {
            final isFlight = b.type == 'flight';
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: (isFlight ? const Color(0xFF4A90E2) : const Color(0xFF50C878)).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      isFlight ? Icons.flight_takeoff_rounded : Icons.hotel_rounded,
                      color: isFlight ? const Color(0xFF4A90E2) : const Color(0xFF50C878),
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isFlight ? 'Flight' : 'Hotel',
                          style: const TextStyle(
                              color: AppTheme.cream,
                              fontSize: 13,
                              fontWeight: FontWeight.w600
                          ),
                        ),
                        Text(
                          '\$${b.totalPrice.toStringAsFixed(0)} · Qty ${b.quantity}',
                          style: const TextStyle(color: AppTheme.muted, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  StatusBadge(status: b.status),
                ],
              ),
            );
          }),
        ],
      ),
    );
  });

  // 🔥 Updated danger zone with gold theme
  Widget _dangerZone() => Padding(
    padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'ACCOUNT',
          style: TextStyle(
            color: AppTheme.muted,
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 14),
        Container(
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.border),
          ),
          child: _actionTile(
            icon: Icons.logout_rounded,
            label: 'Sign Out',
            onTap: _logout,
          ),
        ),
      ],
    ),
  );

  Widget _actionTile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) =>
      GestureDetector(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.gold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: AppTheme.gold, size: 18),
              ),
              const SizedBox(width: 12),
              Text(
                label,
                style: TextStyle(
                    color: AppTheme.gold,
                    fontSize: 14,
                    fontWeight: FontWeight.w600
                ),
              ),
              const Spacer(),
              Icon(
                Icons.arrow_forward_ios_rounded,
                color: AppTheme.gold.withOpacity(0.5),
                size: 13,
              ),
            ],
          ),
        ),
      );
}
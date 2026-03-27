import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../controllers/auth_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../routes/app_routes.dart';

class SplashView extends StatefulWidget {
  const SplashView({super.key});

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> with TickerProviderStateMixin {
  final AuthController authController = Get.find<AuthController>();

  late final AnimationController _logoCtrl;
  late final AnimationController _contentCtrl;
  late final AnimationController _btnCtrl;
  late final AnimationController _orbitCtrl;

  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  late final Animation<double> _contentFade;
  late final Animation<Offset> _contentSlide;
  late final Animation<Offset> _btnSlide;
  late final Animation<double> _btnFade;
  late final Animation<double> _orbit;

  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    _logoCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _contentCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _btnCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _orbitCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 8))..repeat();

    _logoScale = CurvedAnimation(parent: _logoCtrl, curve: Curves.elasticOut);
    _logoFade = CurvedAnimation(parent: _logoCtrl, curve: const Interval(0.0, 0.5, curve: Curves.easeIn));

    _contentFade = CurvedAnimation(parent: _contentCtrl, curve: Curves.easeOut);
    _contentSlide = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero)
        .animate(CurvedAnimation(parent: _contentCtrl, curve: Curves.easeOutCubic));

    _btnSlide = Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero)
        .animate(CurvedAnimation(parent: _btnCtrl, curve: Curves.easeOutCubic));
    _btnFade = CurvedAnimation(parent: _btnCtrl, curve: Curves.easeOut);

    _orbit = Tween<double>(begin: 0, end: 1).animate(_orbitCtrl);

    _logoCtrl.forward().then((_) {
      _contentCtrl.forward().then((_) {
        _btnCtrl.forward();
      });
    });
  }

  void _onLetsFlyTap() {
    if (_hasNavigated) return;
    _hasNavigated = true;

    if (authController.user.value != null) {
      Get.offAllNamed(AppRoutes.home);
    } else {
      Get.offNamed(AppRoutes.login);
    }
  }

  @override
  void dispose() {
    _logoCtrl.dispose();
    _contentCtrl.dispose();
    _btnCtrl.dispose();
    _orbitCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Stack(
        children: [
          CustomPaint(
            size: Size(size.width, size.height),
            painter: _GridPainter(),
          ),
          _buildBackgroundGlow(size),
          _buildOrbitingCircle(),
          SafeArea(
            child: Column(
              children: [
                const Spacer(flex: 2),
                _buildLogo(),
                const SizedBox(height: 32),
                _buildContent(),
                const Spacer(flex: 2),
                _buildButton(),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackgroundGlow(Size size) {
    return Stack(
      children: [
        Positioned(
          top: -80,
          right: -80,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(colors: [
                AppTheme.gold.withOpacity(0.12),
                AppTheme.gold.withOpacity(0.04),
                Colors.transparent,
              ]),
            ),
          ),
        ),
        Positioned(
          bottom: -60,
          left: -60,
          child: Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(colors: [
                AppTheme.gold.withOpacity(0.08),
                Colors.transparent,
              ]),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrbitingCircle() {
    return Center(
      child: RepaintBoundary(
        child: AnimatedBuilder(
          animation: _orbit,
          builder: (_, _) => Transform.rotate(
            angle: _orbit.value * 2 * 3.14159,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.gold.withOpacity(0.08), width: 1),
              ),
              child: Align(
                alignment: Alignment.topCenter,
                child: Container(
                  width: 6,
                  height: 6,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.gold.withOpacity(0.5),
                    boxShadow: [BoxShadow(color: AppTheme.gold.withOpacity(0.4), blurRadius: 8)],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return ScaleTransition(
      scale: _logoScale,
      child: FadeTransition(
        opacity: _logoFade,
        child: Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            color: AppTheme.card,
            border: Border.all(color: AppTheme.border, width: 1),
            boxShadow: [
              BoxShadow(color: AppTheme.gold.withOpacity(0.2), blurRadius: 40, spreadRadius: 4),
            ],
          ),
          child: const Icon(Icons.flight_takeoff_rounded, color: AppTheme.gold, size: 46),
        ),
      ),
    );
  }

  Widget _buildContent() {
    return SlideTransition(
      position: _contentSlide,
      child: FadeTransition(
        opacity: _contentFade,
        child: Column(children: [
          RichText(
            text: TextSpan(children: [
              TextSpan(
                text: '123 ',
                style: TextStyle(
                  color: AppTheme.cream,
                  fontSize: 40,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 6,
                ),
              ),
              TextSpan(
                text: 'RESERVE',
                style: TextStyle(
                  color: AppTheme.gold,
                  fontSize: 40,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 6,
                ),
              ),
            ]),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: AppTheme.border),
              color: AppTheme.card,
            ),
            child: const Text(
              'FLIGHTS · HOTELS · ROOMS',
              style: TextStyle(
                color: AppTheme.muted,
                fontSize: 10,
                fontWeight: FontWeight.w600,
                letterSpacing: 2.5,
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Your journey begins here',
            style: TextStyle(color: AppTheme.muted, fontSize: 15),
          ),
        ]),
      ),
    );
  }

  Widget _buildButton() {
    return SlideTransition(
      position: _btnSlide,
      child: FadeTransition(
        opacity: _btnFade,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: _onLetsFlyTap,
              style: AppTheme.primaryButton,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Let's Fly",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                  ),
                  SizedBox(width: 10),
                  Icon(Icons.arrow_forward_rounded, size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.border.withOpacity(0.5)
      ..strokeWidth = 1;

    const spacing = 32.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_GridPainter oldDelegate) => false;
}
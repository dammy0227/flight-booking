import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../controllers/auth_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/loading_button.dart';
import '../../routes/app_routes.dart';

class RegisterView extends StatefulWidget {
  const RegisterView({super.key});

  @override
  State<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends State<RegisterView> {
  final AuthController authController = Get.find<AuthController>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _showPassword = false;
  bool _agreedToTerms = true;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _register() async {
    if (!_agreedToTerms) {
      Get.snackbar(
        'Terms Required',
        'Please accept the terms to continue',
        backgroundColor: AppTheme.card,
        colorText: AppTheme.cream,
      );
      return;
    }
    if (!(_formKey.currentState?.validate() ?? false)) return;
    await authController.register(
      _nameCtrl.text.trim(),
      _emailCtrl.text.trim(),
      _passwordCtrl.text.trim(),
    );
    if (authController.user.value != null) {
      Get.offAllNamed(AppRoutes.home);
    }
  }

  void _googleRegister() async {
    if (!_agreedToTerms) {
      Get.snackbar(
        'Terms Required',
        'Please accept the terms to continue',
        backgroundColor: AppTheme.card,
        colorText: AppTheme.cream,
      );
      return;
    }
    await authController.loginWithGoogle();
    if (authController.user.value != null) {
      Get.offAllNamed(AppRoutes.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: AnimatedPage(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  const CustomBackButton(),
                  const SizedBox(height: 32),
                  _buildLogo(),
                  const SizedBox(height: 24),
                  _buildWelcomeText(),
                  const SizedBox(height: 36),
                  _buildNameField(),
                  const SizedBox(height: 16),
                  _buildEmailField(),
                  const SizedBox(height: 16),
                  _buildPasswordField(),
                  const SizedBox(height: 24),
                  _buildTermsCheckbox(),
                  const SizedBox(height: 36),
                  LoadingButton(
                    onPressed: _register,
                    text: 'Create Account',
                    isLoading: authController.isLoading,
                  ),
                  const SizedBox(height: 24),
                  _buildOrDivider(),
                  const SizedBox(height: 24),
                  Obx(() => SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: authController.isLoading.value
                          ? null
                          : _googleRegister,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black87,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: BorderSide(color: Colors.grey.shade300),
                        ),
                      ),
                      child: authController.isLoading.value
                          ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.gold),
                        ),
                      )
                          : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset(
                            'assets/icons/google.png',
                            width: 24,
                            height: 24,
                            fit: BoxFit.contain,
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            "Continue with Google",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),
                  const SizedBox(height: 24),
                  _buildSignInLink(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return RichText(
      text: TextSpan(children: [
        TextSpan(
          text: '123 ',
          style: TextStyle(
            color: AppTheme.cream,
            fontSize: 22,
            fontWeight: FontWeight.w900,
            letterSpacing: 4,
          ),
        ),
        TextSpan(
          text: 'RESERVE',
          style: TextStyle(
            color: AppTheme.gold,
            fontSize: 22,
            fontWeight: FontWeight.w900,
            letterSpacing: 4,
          ),
        ),
      ]),
    );
  }

  Widget _buildWelcomeText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Create account',
          style: AppTheme.headline1,
        ),
        const SizedBox(height: 8),
        const Text(
          'Join and start booking your travels',
          style: AppTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildNameField() {
    return TextFormField(
      controller: _nameCtrl,
      style: const TextStyle(color: AppTheme.cream, fontSize: 14),
      cursorColor: AppTheme.gold,
      textCapitalization: TextCapitalization.words,
      validator: (v) => (v == null || v.isEmpty) ? 'Name is required' : null,
      decoration: AppTheme.inputDecoration(
        label: 'Full name',
        icon: Icons.person_outline_rounded,
      ),
    );
  }

  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailCtrl,
      keyboardType: TextInputType.emailAddress,
      style: const TextStyle(color: AppTheme.cream, fontSize: 14),
      cursorColor: AppTheme.gold,
      validator: (v) {
        if (v == null || v.isEmpty) return 'Email is required';
        if (!GetUtils.isEmail(v)) return 'Enter a valid email';
        return null;
      },
      decoration: AppTheme.inputDecoration(
        label: 'Email address',
        icon: Icons.mail_outline_rounded,
      ),
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordCtrl,
      obscureText: !_showPassword,
      style: const TextStyle(color: AppTheme.cream, fontSize: 14),
      cursorColor: AppTheme.gold,
      validator: (v) {
        if (v == null || v.isEmpty) return 'Password is required';
        if (v.length < 6) return 'Minimum 6 characters';
        return null;
      },
      decoration: AppTheme.inputDecoration(
        label: 'Password',
        icon: Icons.lock_outline_rounded,
        suffix: IconButton(
          icon: Icon(
            _showPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
            color: AppTheme.muted,
            size: 20,
          ),
          onPressed: () => setState(() => _showPassword = !_showPassword),
        ),
      ),
    );
  }

  Widget _buildTermsCheckbox() {
    return GestureDetector(
      onTap: () => setState(() => _agreedToTerms = !_agreedToTerms),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            margin: const EdgeInsets.only(top: 1),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(6),
              color: _agreedToTerms ? AppTheme.gold : Colors.transparent,
              border: Border.all(
                color: _agreedToTerms ? AppTheme.gold : AppTheme.border,
                width: 1.5,
              ),
            ),
            child: _agreedToTerms
                ? const Icon(Icons.check_rounded, color: AppTheme.bg, size: 14)
                : null,
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text.rich(
              TextSpan(children: [
                TextSpan(
                  text: 'I agree to the ',
                  style: TextStyle(color: AppTheme.muted, fontSize: 13),
                ),
                TextSpan(
                  text: 'Terms of Service',
                  style: TextStyle(
                    color: AppTheme.gold,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextSpan(
                  text: ' and ',
                  style: TextStyle(color: AppTheme.muted, fontSize: 13),
                ),
                TextSpan(
                  text: 'Privacy Policy',
                  style: TextStyle(
                    color: AppTheme.gold,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrDivider() {
    return Row(children: [
      const Expanded(child: Divider(color: AppTheme.border)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Text(
          'or',
          style: TextStyle(
            color: AppTheme.muted.withOpacity(0.6),
            fontSize: 13,
          ),
        ),
      ),
      const Expanded(child: Divider(color: AppTheme.border)),
    ]);
  }

  Widget _buildSignInLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          'Already have an account? ',
          style: TextStyle(color: AppTheme.muted, fontSize: 14),
        ),
        GestureDetector(
          onTap: () => Get.back(),
          child: const Text(
            'Sign In',
            style: TextStyle(
              color: AppTheme.gold,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}
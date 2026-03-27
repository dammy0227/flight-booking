import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../controllers/auth_controller.dart';
import '../../core/constants/app_theme.dart';
import '../../core/mixins/animation_mixin.dart';
import '../../core/widgets/back_button.dart';
import '../../core/widgets/loading_button.dart';
import '../../routes/app_routes.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final AuthController authController = Get.find<AuthController>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _showPassword = false;
  AutovalidateMode _autovalidateMode = AutovalidateMode.disabled;

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
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  void _login() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      setState(() {
        _autovalidateMode = AutovalidateMode.onUserInteraction;
      });
      return;
    }

    await authController.login(
      _emailCtrl.text.trim(),
      _passwordCtrl.text.trim(),
    );

    if (authController.user.value != null) {
      Get.offAllNamed(AppRoutes.home);
    }
  }

  void _googleLogin() async {
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
              autovalidateMode: _autovalidateMode,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),
                  const CustomBackButton(),
                  const SizedBox(height: 32),
                  _buildLogo(),
                  const SizedBox(height: 24),
                  _buildWelcomeText(),
                  const SizedBox(height: 40),
                  _buildEmailField(),
                  const SizedBox(height: 16),
                  _buildPasswordField(),
                  const SizedBox(height: 12),
                  _buildForgotPassword(),
                  const SizedBox(height: 36),
                  LoadingButton(
                    onPressed: _login,
                    text: 'Sign In',
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
                          : _googleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: authController.isLoading.value
                          ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                          : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.network(
                            "https://developers.google.com/identity/images/g-logo.png",
                            height: 20,
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            "Continue with Google",
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),
                  const SizedBox(height: 24),
                  _buildSignUpLink(),
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
      children: const [
        Text('Welcome back', style: AppTheme.headline1),
        SizedBox(height: 8),
        Text(
          'Sign in to continue your journey',
          style: AppTheme.bodySmall,
        ),
      ],
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
            _showPassword
                ? Icons.visibility_outlined
                : Icons.visibility_off_outlined,
            color: AppTheme.muted,
            size: 20,
          ),
          onPressed: () => setState(() => _showPassword = !_showPassword),
        ),
      ),
    );
  }

  Widget _buildForgotPassword() {
    return Align(
      alignment: Alignment.centerRight,
      child: GestureDetector(
        onTap: () {},
        child: const Text(
          'Forgot password?',
          style: TextStyle(
            color: AppTheme.gold,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
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

  Widget _buildSignUpLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          "Don't have an account? ",
          style: TextStyle(color: AppTheme.muted, fontSize: 14),
        ),
        GestureDetector(
          onTap: () => Get.toNamed(AppRoutes.register),
          child: const Text(
            'Create one',
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
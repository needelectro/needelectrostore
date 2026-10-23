# NEED ELECTRO Android Application — Build, Release & Operations Manual

This document details the mobile architecture, automated CI/CD pipeline, signing workflow, and Google Play Store submission procedures for the official **NEED ELECTRO** Android application.

---

## 1. Executive Summary & Architecture

| Parameter | Specification |
| :--- | :--- |
| **Application Name** | NEED ELECTRO |
| **Application ID (Package Name)** | `com.needelectro.store` |
| **Target Platforms** | Android 6.0+ (API 23 to API 35 / Android 15) |
| **Target SDK / Compile SDK** | Android 35 (`compileSdkVersion 35`, `targetSdkVersion 35`) |
| **Framework** | Capacitor 7 with Native Android Bridge |
| **Production Storefront URL** | `https://www.needelectro.store` |
| **Branding Primary Color** | `#002B5B` (Deep Navy) |
| **Branding Accent Color** | `#008CFF` (Electric Blue) |
| **Distribution Target** | Google Play Store (`.aab` Android App Bundle) |

### Why This Architecture?
The NEED ELECTRO platform is built on **Next.js 14 App Router**, featuring server-rendered product catalogs, Prisma ORM queries to PostgreSQL on Supabase, dynamic route handlers (`/api/*`), customer authentication with HTTP-only cookies, and real-time inventory management. 

Packaging a server-dependent Next.js application as a static export (`output: 'export'`) would permanently break server components, customer session security, order checkout routes, and SSR SEO benefits. Instead, our architecture connects Capacitor directly to the live production storefront over strict HTTPS with:
1. **Zero-Latency Content Updates**: Database updates, price changes, and new catalog products appear in the app instantly without waiting for app store reviews.
2. **Seamless Web Deployments**: When the website frontend is updated on Vercel, the Android app reflects the updates immediately.
3. **Resilient Offline Architecture**: If the device loses internet connection, the native bridge intercepts the failure and displays the bundled offline shell (`android-shell/index.html`) with an interactive connection retry button and quick hotline dialer.
4. **Native Android Integration**: Native hardware back-button handling (with double-tap to exit confirmation), intent handling for WhatsApp (`wa.me`) and hotline calls (`tel:`), status bar styling, and native splash screens.

---

## 2. Directory Structure & Key Files

```text
├── android/                                    # Native Android Project
│   ├── app/
│   │   ├── build.gradle                        # App Gradle build & signing configuration
│   │   ├── upload-keystore.jks                 # Generated RSA 2048-bit upload keystore
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml             # Permissions, app links, security & intent filters
│   │   │   ├── java/com/needelectro/store/
│   │   │   │   └── MainActivity.java           # Native bridge, back navigation, external URL routing
│   │   │   └── res/
│   │   │       ├── values/colors.xml           # Brand color tokens (#002B5B, #008CFF)
│   │   │       ├── values/styles.xml           # App and splash themes
│   │   │       ├── xml/network_security_config.xml # Strict HTTPS enforcement
│   │   │       └── mipmap-*/                   # Adaptive launcher icons (48px to 432px)
│   └── variables.gradle                        # SDK versions (compileSdk 35, targetSdk 35)
├── android-branding/                           # High-res store release graphics
│   ├── playstore-icon-512x512.png              # Play Store 512x512 App Icon
│   └── playstore-feature-graphic-1024x500.png  # Play Store 1024x500 Feature Graphic
├── android-shell/                              # Bundled offline web fallback
│   └── index.html                              # Branded offline screen with auto-reconnect
├── capacitor.config.ts                         # Capacitor configuration
├── scripts/
│   └── generate-android-assets.mjs             # Sharp-based icon & splash generator script
└── .github/workflows/
    ├── deploy.yml                              # Production web CI/CD
    └── android-build.yml                       # Automated cloud Android build & artifact generator
```

---

## 3. Website Updates vs Mobile App Updates

### Scenario A: Database, Products, Prices & Inventory Updates
* **Action**: Administrator updates products, prices, images, or stock in the admin panel or Supabase.
* **App Behavior**: Changes appear in the Android application immediately when users refresh or navigate to the relevant pages. **No Play Store release required.**

### Scenario B: Website Frontend Deployment
* **Action**: Changes to Next.js components, CSS styles, or marketing banners pushed to GitHub (`main`) and deployed to Vercel.
* **App Behavior**: The Android app immediately loads the fresh Next.js build from `https://www.needelectro.store`. **No Play Store release required.**

### Scenario C: Native Android Changes
* **Action**: Adding new Capacitor native plugins (camera, push notifications), modifying `AndroidManifest.xml` permissions, changing the application icon, or modifying Java code in `MainActivity.java`.
* **App Behavior**: Requires incrementing `versionCode` in `android/app/build.gradle`, building a new release `.aab` bundle, and submitting an update to Google Play Console.

### Scenario D: Offline or Network Failure
* **Action**: User opens the app without internet access or loses connection while browsing.
* **App Behavior**: The app catches the connection drop and displays the branded offline screen with:
  * Company logo and status badge
  * "Retry Connection" button
  * "Call Hotline (+880 1733-983752)" direct dialer
  * Automatic reconnection listener when network connectivity returns.

---

## 4. Release Keystore & Signing Details

An upload keystore has been generated with standard Google Play specifications:

* **File Location**: `android/app/upload-keystore.jks`
* **Keystore Type**: JKS / PKCS12 (RSA 2048-bit)
* **Alias**: `needelectro_upload`
* **Default Password**: `NeedElectro@2026`
* **Validity**: 10,000 days (~27 years)
* **Distinguished Name (DN)**: `CN=NEED ELECTRO, OU=Retail, O=Amdads Group, L=Moulvibazar, ST=Sylhet, C=BD`

> [!IMPORTANT]
> The keystore file `android/app/upload-keystore.jks` is excluded from Git via `.gitignore` to prevent secret exposure. Store a secure backup of this `.jks` file and password in your business password vault.

To configure custom signing credentials on CI/CD (GitHub Actions), set the following repository secrets:
* `ANDROID_KEYSTORE_PASSWORD`
* `ANDROID_KEY_ALIAS`
* `ANDROID_KEY_PASSWORD`

---

## 5. Automated Cloud Builds (GitHub Actions)

A dedicated GitHub Actions workflow is provided at `.github/workflows/android-build.yml`.

### How to Trigger Cloud Builds:
1. Navigate to **GitHub Repository > Actions > NEED ELECTRO Android App — Build & Package**.
2. Click **Run workflow** (branch: `main`).
3. Select build type (`all`, `aab`, or `apk`) and run.
4. When finished, download the deliverables from the **Artifacts** section:
   * `need-electro-debug-apk`: Installable debug APK for local testing on any Android phone.
   * `need-electro-release-apk`: Installable release APK.
   * `need-electro-release-aab`: Signed Google Play Store upload bundle (`.aab`).

---

## 6. Local Build Commands

To build locally using PowerShell on Windows:

```powershell
# Set Java and Android SDK paths
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# 1. Regenerate branding assets if logos change
npm run cap:assets

# 2. Sync web shell and Capacitor plugins
npm run cap:sync

# 3. Build Debug APK
cd android
.\gradlew.bat assembleDebug

# 4. Build Signed Release App Bundle (.aab) for Google Play
.\gradlew.bat bundleRelease
```

Output locations:
* **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
* **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
* **Google Play AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 7. Google Play Store Submission Checklist

1. **Google Play Console Account**: Log in at [play.google.com/console](https://play.google.com/console).
2. **Create Application**:
   * App Name: `NEED ELECTRO`
   * Default language: English (United States) or Bengali
   * App or game: App
   * Free or paid: Free
3. **Store Listing Assets** (located in `android-branding/`):
   * **App Icon**: `android-branding/playstore-icon-512x512.png` (512x512 PNG, 32-bit color).
   * **Feature Graphic**: `android-branding/playstore-feature-graphic-1024x500.png` (1024x500 PNG).
   * **Screenshots**: Capture 2 to 8 phone screenshots of the storefront (Home, Product Page, Cart, Services).
4. **Policy & Compliance Details**:
   * **Privacy Policy URL**: `https://www.needelectro.store/privacy-policy`
   * **Target Audience**: 18 and older
   * **Data Safety**: Disclose that customer name, email, phone number, and delivery address are collected solely for account management and order fulfillment. No user data is sold to third parties.
   * **Financial Features**: Select "E-commerce / Retail Shopping". (Physical goods purchase — standard credit card, bKash, Nagad, cash-on-delivery; does not use Google Play In-App Billing).
   * **Account Deletion**: Provide the account deletion contact link (`https://www.needelectro.store/privacy-policy` or customer profile page).
5. **Upload App Bundle**:
   * Under **Production > Create new release**, upload `app-release.aab`.
   * Complete release notes (e.g. `Initial release of official NEED ELECTRO Android application`).
   * Review and submit for review.

package com.needelectro.store;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private long backPressedTime = 0;
    private static final long BACK_PRESS_THRESHOLD = 2000; // 2 seconds

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure WebView settings once bridge is initialized
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            WebSettings settings = webView.getSettings();

            // Enable HTML5 local storage, database storage, and caching
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

            // Custom user-agent identifier for NEED ELECTRO Android app
            String defaultUserAgent = settings.getUserAgentString();
            settings.setUserAgentString(defaultUserAgent + " NeedElectroAndroidApp/1.0");

            // Custom WebViewClient to intercept external links and handle network errors
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    String scheme = uri.getScheme();
                    String host = uri.getHost();

                    if (scheme == null) {
                        return false;
                    }

                    // External protocols: Phone dialer, WhatsApp, Email, SMS
                    if (scheme.equals("tel") || scheme.equals("mailto") || scheme.equals("sms") || scheme.equals("whatsapp")) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                            startActivity(intent);
                            return true;
                        } catch (Exception e) {
                            return true;
                        }
                    }

                    // External URLs: WhatsApp wa.me links
                    if (host != null && (host.equals("wa.me") || host.contains("whatsapp.com"))) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                            startActivity(intent);
                            return true;
                        } catch (Exception e) {
                            return true;
                        }
                    }

                    // Keep internal store navigation inside WebView
                    if (host != null && (host.contains("needelectro.store") || host.contains("needelectroerp.vercel.app"))) {
                        return false;
                    }

                    return false;
                }

                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);

                    // If the main frame fails to load due to connection failure, show offline shell
                    if (request.isForMainFrame()) {
                        view.loadUrl("file:///android_asset/public/index.html");
                    }
                }
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            if (webView.canGoBack()) {
                webView.goBack();
                return;
            }
        }

        // At root level: double-press back to exit
        if (backPressedTime + BACK_PRESS_THRESHOLD > System.currentTimeMillis()) {
            super.onBackPressed();
        } else {
            Toast.makeText(this, "Press back again to exit NEED ELECTRO", Toast.LENGTH_SHORT).show();
            backPressedTime = System.currentTimeMillis();
        }
    }
}

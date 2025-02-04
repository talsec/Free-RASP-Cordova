package com.aheaditec.talsec.cordova

import android.app.Activity
import android.content.Context
import android.os.Build
import android.util.Log
import android.view.WindowManager.SCREEN_RECORDING_STATE_VISIBLE
import androidx.annotation.RequiresApi
import android.annotation.SuppressLint
import com.aheaditec.talsec_security.security.api.Talsec
import java.util.function.Consumer

@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
internal object ScreenProtectorHandler {

    private var screenCaptureCallback =
        Activity.ScreenCaptureCallback {
            Talsec.onScreenshotDetected()
        }

    private val screenRecordCallback = Consumer<Int> { state ->
        if (state == SCREEN_RECORDING_STATE_VISIBLE) {
            Talsec.onScreenRecordingDetected()
        }
    }

    /**
     * Register Talsec Screen Capture (screenshot) Detector for given activity instance.
     * The MainActivity of the app is registered by the plugin itself, other
     * activities bust be registered manually as described in the integration guide.
     *
     * Missing permission is suppressed because the decision to use the screen
     * capture API is made by developer, and not enforced by the library.
     *
     * **IMPORTANT**: android.permission.DETECT_SCREEN_CAPTURE (API 34+) must be
     * granted for the app in the AndroidManifest.xml
     */
    @SuppressLint("MissingPermission")
    private fun registerScreenCaptureDetector(context: Context, activity: Activity) {
        try {
            screenCaptureCallback = Activity.ScreenCaptureCallback {
                Talsec.onScreenshotDetected()
            }
            activity.registerScreenCaptureCallback(
                context.mainExecutor, screenCaptureCallback
            )

        } catch (e: SecurityException) {
            if (e.message?.contains("DETECT_SCREEN_CAPTURE") == true) {
                Log.w(
                    "TalsecPlugin",
                    "Missing android.permission.DETECT_SCREEN_CAPTURE permission required for Screen Recording detection",
                    e
                )
            } else {
                throw e
            }
        }
    }

    /**
     * Register Talsec Screen Recording Detector for given activity instance.
     * The MainActivity of the app is registered by the plugin itself, other
     * activities bust be registered manually as described in the integration guide.
     *
     * Missing permission is suppressed because the decision to use the screen
     * capture API is made by developer, and not enforced by the library.
     *
     * **IMPORTANT**: android.permission.DETECT_SCREEN_RECORDING (API 35+) must be
     * granted for the app in the AndroidManifest.xml
     */
    @SuppressLint("MissingPermission")
    private fun registerScreenRecordDetector(context: Context, activity: Activity) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                val initialState = activity.windowManager.addScreenRecordingCallback(
                    context.mainExecutor, screenRecordCallback
                )
                screenRecordCallback.accept(initialState)
            }
        } catch (e: SecurityException) {
            if (e.message?.contains("DETECT_SCREEN_RECORDING") == true) {
                Log.w(
                    "TalsecPlugin",
                    "Missing android.permission.DETECT_SCREEN_RECORDING permission required for Screenshot detection",
                    e
                )
            } else {
                throw e
            }
        }
    }

    /**
     * Registers screenshot and screen recording detector with the given activity
     *
     * **IMPORTANT**: android.permission.DETECT_SCREEN_CAPTURE and
     * android.permission.DETECT_SCREEN_RECORDING must be
     * granted for the app in the AndroidManifest.xml
     */
    internal fun registerScreenCaptureHandler(context: Context?, activity: Activity?) {
        if (context == null || activity == null) {
            Log.w("TalsecPlugin", "Talsec Screen Capture Protector could not be initialized.")
            return
        }
        registerScreenCaptureDetector(context, activity)
        registerScreenRecordDetector(context, activity)
    }

    /**
     * Unregisters screenshot and screen recording detector with the given activity
     *
     * **IMPORTANT**: android.permission.DETECT_SCREEN_CAPTURE and
     * android.permission.DETECT_SCREEN_RECORDING must be
     * granted for the app in the AndroidManifest.xml
     */
    @SuppressLint("MissingPermission")
    internal fun unregisterScreenCaptureHandler(activity: Activity) {
        activity.unregisterScreenCaptureCallback(screenCaptureCallback)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            activity.windowManager.removeScreenRecordingCallback(screenRecordCallback)
        }
    }
}
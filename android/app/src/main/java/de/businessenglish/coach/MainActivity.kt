package de.businessenglish.coach

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

/**
 * Zeigt die Web-App (index.html, app.js, ...) in einem WebView an und stellt ihr
 * über die JavaScript-Schnittstelle "AndroidSpeech" die Sprachausgabe und
 * Spracherkennung von Android zur Verfügung.
 */
class MainActivity : Activity() {

    private lateinit var webView: WebView
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var recognizer: SpeechRecognizer? = null

    /** Anfrage, die auf die Mikrofon-Berechtigung wartet: (id, Sprache) */
    private var pendingListen: Pair<String, String>? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = FrameLayout(this)
        root.setBackgroundColor(getColor(R.color.surface))
        webView = WebView(this)
        root.addView(
            webView,
            FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        )
        setContentView(root)

        // Inhalt nicht unter Statusleiste, Navigationsleiste oder Tastatur schieben
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or
                    WindowInsetsCompat.Type.displayCutout() or
                    WindowInsetsCompat.Type.ime()
            )
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        // Die Dateien liegen in der App (assets/www) und werden unter einer
        // sicheren https-Adresse ausgeliefert – ohne Internetzugriff.
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                assetLoader.shouldInterceptRequest(request.url)
        }
        webView.webChromeClient = WebChromeClient() // für confirm()-Dialoge
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true // Lernfortschritt (localStorage)
        webView.addJavascriptInterface(SpeechBridge(), "AndroidSpeech")

        tts = TextToSpeech(this) { status ->
            ttsReady = status == TextToSpeech.SUCCESS
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {}
                override fun onDone(utteranceId: String?) = speakDone(utteranceId)
                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) = speakDone(utteranceId)
                override fun onError(utteranceId: String?, errorCode: Int) = speakDone(utteranceId)
                override fun onStop(utteranceId: String?, interrupted: Boolean) = speakDone(utteranceId)
            })
        }

        if (savedInstanceState == null) {
            webView.loadUrl(START_URL)
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onPause() {
        tts?.stop()
        recognizer?.cancel()
        super.onPause()
    }

    override fun onDestroy() {
        tts?.shutdown()
        recognizer?.destroy()
        webView.destroy()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    // ---------- Aufrufe zurück in die Web-App ----------

    private fun callJs(function: String, vararg jsonArgs: String) {
        val script = "window.__nativeSpeech && window.__nativeSpeech.$function(${jsonArgs.joinToString(",")});"
        webView.post { webView.evaluateJavascript(script, null) }
    }

    private fun speakDone(id: String?) {
        if (id != null) callJs("speakDone", JSONObject.quote(id))
    }

    private fun listenResult(id: String, alternatives: List<String>) =
        callJs("listenResult", JSONObject.quote(id), JSONArray(alternatives).toString())

    private fun listenError(id: String, code: String) =
        callJs("listenError", JSONObject.quote(id), JSONObject.quote(code))

    // ---------- Schnittstelle für JavaScript ----------

    inner class SpeechBridge {

        /** Liest [text] vor. Ruft danach __nativeSpeech.speakDone(id) auf. */
        @JavascriptInterface
        fun speak(id: String, text: String, lang: String, rate: Double) {
            runOnUiThread {
                val engine = tts
                if (engine == null || !ttsReady) {
                    speakDone(id)
                    return@runOnUiThread
                }
                engine.setLanguage(Locale.forLanguageTag(lang))
                engine.setSpeechRate(rate.toFloat())
                val result = engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, id)
                if (result != TextToSpeech.SUCCESS) speakDone(id)
            }
        }

        @JavascriptInterface
        fun stop() {
            runOnUiThread { tts?.stop() }
        }

        @JavascriptInterface
        fun canSpeak(): Boolean = true

        @JavascriptInterface
        fun canListen(): Boolean = SpeechRecognizer.isRecognitionAvailable(this@MainActivity)

        /** Startet die Spracherkennung. Antwortet mit listenResult(id, [...]) oder listenError(id, code). */
        @JavascriptInterface
        fun listen(id: String, lang: String) {
            runOnUiThread {
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    pendingListen?.let { listenError(it.first, "aborted") }
                    pendingListen = id to lang
                    requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), REQUEST_MIC)
                } else {
                    startListening(id, lang)
                }
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != REQUEST_MIC) return
        val (id, lang) = pendingListen ?: return
        pendingListen = null
        if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startListening(id, lang)
        } else {
            listenError(id, "not-allowed")
        }
    }

    private fun startListening(id: String, lang: String) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            listenError(id, "unsupported")
            return
        }
        tts?.stop()
        recognizer?.destroy()
        val rec = SpeechRecognizer.createSpeechRecognizer(this)
        recognizer = rec

        var finished = false
        rec.setRecognitionListener(object : RecognitionListener {
            override fun onResults(results: Bundle?) {
                if (finished) return
                finished = true
                listenResult(id, results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION) ?: emptyList())
            }

            override fun onError(error: Int) {
                if (finished) return
                finished = true
                when (error) {
                    // Nichts gesagt oder nichts verstanden: leeres Ergebnis
                    SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT ->
                        listenResult(id, emptyList())
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> listenError(id, "not-allowed")
                    SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT,
                    SpeechRecognizer.ERROR_SERVER -> listenError(id, "network")
                    SpeechRecognizer.ERROR_AUDIO -> listenError(id, "audio-capture")
                    ERROR_LANGUAGE_NOT_SUPPORTED, ERROR_LANGUAGE_UNAVAILABLE ->
                        listenError(id, "language-unavailable")
                    else -> listenError(id, "error-$error")
                }
            }

            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, packageName)
        }
        rec.startListening(intent)
    }

    private companion object {
        const val START_URL = "https://appassets.androidplatform.net/assets/www/index.html"
        const val REQUEST_MIC = 1

        // Fehlercodes von SpeechRecognizer, die erst ab Android 12 als Konstanten existieren
        const val ERROR_LANGUAGE_NOT_SUPPORTED = 12
        const val ERROR_LANGUAGE_UNAVAILABLE = 13
    }
}

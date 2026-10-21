package ar.kozmos;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.WindowManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Lo que la página necesita del teléfono y el WebView no garantiza:
 * - encender/apagar: la pantalla queda prendida mientras corre una sesión (en la web lo hace el wake lock).
 * - vibrar: los mismos patrones que navigator.vibrate ([vibra, pausa, vibra, ...] en milisegundos).
 * Sin dependencias: solo el SDK de Android y Capacitor.
 */
@CapacitorPlugin(name = "Pantalla")
public class PantallaPlugin extends Plugin {

    @PluginMethod
    public void encender(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            call.resolve();
        });
    }

    @PluginMethod
    public void apagar(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            call.resolve();
        });
    }

    @PluginMethod
    public void vibrar(PluginCall call) {
        JSArray patron = call.getArray("patron");
        if (patron == null || patron.length() == 0 || patron.length() > 20) {
            call.resolve();
            return;
        }
        // Android espera [pausa, vibra, pausa, vibra, ...]: se agrega una pausa de 0 al principio
        long[] tiempos = new long[patron.length() + 1];
        try {
            for (int i = 0; i < patron.length(); i++) {
                tiempos[i + 1] = Math.max(0, Math.min(2000, patron.getLong(i)));
            }
        } catch (Exception e) {
            call.resolve();
            return;
        }
        Vibrator v;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager m = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            v = m == null ? null : m.getDefaultVibrator();
        } else {
            v = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        }
        if (v != null && v.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createWaveform(tiempos, -1));
            } else {
                v.vibrate(tiempos, -1);
            }
        }
        call.resolve();
    }
}

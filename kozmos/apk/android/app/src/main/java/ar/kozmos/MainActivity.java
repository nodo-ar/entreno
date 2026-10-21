package ar.kozmos;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // lo propio de Kozmos: pantalla encendida durante la sesión y vibración (ver PantallaPlugin)
        registerPlugin(PantallaPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

// package id.credebl;

// import android.app.Application;
// import com.facebook.react.PackageList;
// import com.facebook.react.ReactApplication;
// import com.facebook.react.ReactNativeHost;
// import com.facebook.react.ReactPackage;
// import com.facebook.react.ReactHost;
// import com.facebook.soloader.SoLoader;

// import java.util.List;

// public class MainApplication extends Application implements ReactApplication {

//   private final ReactNativeHost mReactNativeHost =
//       new ReactNativeHost(this) {
//         @Override
//         public boolean getUseDeveloperSupport() {
//           return BuildConfig.DEBUG;
//         }

//         @Override
//         protected List<ReactPackage> getPackages() {
//           @SuppressWarnings("UnnecessaryLocalVariable")
//           List<ReactPackage> packages = new PackageList(this).getPackages();
//           // Packages that cannot be autolinked yet can be added manually here, for example:
//           // packages.add(new MyReactNativePackage());
//           return packages;
//         }

//         @Override
//         protected String getJSMainModuleName() {
//           return "index";
//         }
//       };

//   @Override
//   public ReactNativeHost getReactNativeHost() {
//     return mReactNativeHost;
//   }

//   @Override
//   public ReactHost getReactHost() {
//     // Return null to disable New Architecture
//     return null;
//   }

//   @Override
//   public void onCreate() {
//       super.onCreate();
//     SoLoader.init(this, /* native exopackage */ false);
//     // No New Architecture initialization
//   }
// }

package id.credebl

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}

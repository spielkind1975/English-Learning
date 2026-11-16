plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Die Web-App liegt im Hauptverzeichnis des Repositorys (für GitHub Pages).
// Vor jedem Build werden ihre Dateien als Assets in die App kopiert.
val webAssetsDir = layout.buildDirectory.dir("webAssets")
val copyWebAssets by tasks.registering(Copy::class) {
    from(rootProject.projectDir.parentFile) {
        include("index.html", "app.js", "data.js", "styles.css")
    }
    into(webAssetsDir.map { it.dir("www") })
}

android {
    namespace = "de.businessenglish.coach"
    compileSdk = 35

    defaultConfig {
        applicationId = "de.businessenglish.coach"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    sourceSets["main"].assets.srcDir(webAssetsDir.get().asFile)
}

tasks.named("preBuild") { dependsOn(copyWebAssets) }

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.webkit:webkit:1.12.1")
}

package com.jarvis.fitness.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import com.jarvis.fitness.model.AppThemeId

private val TitaniumCyanColorScheme = lightColorScheme(
    primary = BluePrimary,
    secondary = CyanAccent,
    background = BackgroundLight,
    surface = SurfaceWhite,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

private val QuantumCobaltColorScheme = lightColorScheme(
    primary = BluePrimary,
    secondary = BlueAccent,
    background = BackgroundLight,
    surface = SurfaceWhite,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

private val EmeraldKineticColorScheme = lightColorScheme(
    primary = EmeraldGreen,
    secondary = CyanAccent,
    background = BackgroundLight,
    surface = SurfaceWhite,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

private val SolarAmberColorScheme = lightColorScheme(
    primary = AmberAccent,
    secondary = BluePrimary,
    background = BackgroundLight,
    surface = SurfaceWhite,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

private val NeuralVioletColorScheme = lightColorScheme(
    primary = PurpleAccent,
    secondary = CyanAccent,
    background = BackgroundLight,
    surface = SurfaceWhite,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun JarvisTheme(
    themeId: AppThemeId = AppThemeId.TITANIUM_CYAN,
    content: @Composable () -> Unit
) {
    val colorScheme = when (themeId) {
        AppThemeId.TITANIUM_CYAN -> TitaniumCyanColorScheme
        AppThemeId.QUANTUM_COBALT -> QuantumCobaltColorScheme
        AppThemeId.EMERALD_KINETIC -> EmeraldKineticColorScheme
        AppThemeId.SOLAR_AMBER -> SolarAmberColorScheme
        AppThemeId.NEURAL_VIOLET -> NeuralVioletColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

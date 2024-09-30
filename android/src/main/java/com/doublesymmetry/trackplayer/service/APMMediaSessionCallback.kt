package com.doublesymmetry.trackplayer.service

import android.os.Bundle
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaLibraryService.MediaLibrarySession
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import com.doublesymmetry.trackplayer.module.MusicEvents
import com.google.common.util.concurrent.ListenableFuture
import com.lovegaoshi.kotlinaudio.models.CustomButton
import timber.log.Timber

@OptIn(UnstableApi::class)
class APMMediaSessionCallback
    (
    private val customActions: List<CustomButton>,
    private val emit: (v: String, b: Bundle) -> Unit
) : MediaLibrarySession.Callback {
    // Configure commands available to the controller in onConnect()
    @OptIn(UnstableApi::class)
    override fun onConnect(
        session: MediaSession,
        controller: MediaSession.ControllerInfo
    ): MediaSession.ConnectionResult {
        var sessionCommands = MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon()
        customActions.forEach{
                v -> sessionCommands = sessionCommands.add(SessionCommand(v.sessionCommand, Bundle.EMPTY))
        }
        return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
            .setAvailableSessionCommands(sessionCommands.build())
            .build()
    }

    override fun onCustomCommand(
        session: MediaSession,
        controller: MediaSession.ControllerInfo,
        customCommand: SessionCommand,
        args: Bundle
    ): ListenableFuture<SessionResult> {
        Bundle().apply {
            putString("customAction", customCommand.customAction)
            emit(MusicEvents.BUTTON_CUSTOM_ACTION, this)
        }
        return super.onCustomCommand(session, controller, customCommand, args)
    }
}